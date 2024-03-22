---
sidebar_position: 7
---

# La base de données 
Toute notre application back-end a été mis en place dans un environnement de développement sous Docker. Cela nous a permis d’encapsuler toutes les dépendances, les configurations requises dans des conteneurs autonomes et permettre à chaque membre de l’équipe de développement de travailler avec le même environnement et de faciliter la collaboration.
Nous avons crée un fichier docker-compose.yml dans lequel nous avons déclaré plusieurs services avec des images Docker afin de créer l’architecture de notre application et faciliter la gestion de plusieurs conteneurs.

```yaml
# mysql
mysql8-service:
container_name: mysql8-container
image: mysql:8.0
ports:
    - "portnumber:portnumber"
volumes:
    - mysql:/var/lib/mysql
restart: always # always restart unless stopped manually
environment:
    MYSQL_ROOT_PASSWORD: supersecretpasswordyouwontfindha!
networks:
    - nginx-php81-mysql8
```

Dans cet extrait de notre fichier `docker-compose.yml` nous déclarons un service MySQL en utilisant sur l’image Docker `mysql:8.0`. Un conteneur Docker sera créé avec une instance de la base de données MySQL.

## Configuration de la base de données 
Nous avons ensuite créé un fichier `.env.local` à la racine du projet dans lequel nous avons mis en place une variable d’environnement qui indique comment notre application se connecte à la base de données.

`DATABASE_URL="mysql://root:supersecretpasswordyouwontfindha!@mysql8-service:3306/gyn-and-
co-db?serverVersion=8&charset=utf8mb4"`

Dans cet extrait de notre fichier, l’URL fait référence à l’adresse de la base de données MySQL défini dans le fichier `docker-compose.yml` est exécuté dans le conteneur Docker.

## La création de le base de données
Pour la prochaine étape nous avons créé un fichier Makefile qui permet de créer des commandes prédéfinies afin d’automatiser plusieurs tâches. Cela facilite le travail de l’équipe en réduisant les étapes manuelles nécessaires pour configurer et préparer notre application la base de données de notre application.
Nous avons créé une commande prédéfinie make database qui effectuent plusieurs opérations à l’intérieur du conteneur Docker lié à la base de données de notre application.

La première que nous avons configurée permet de créer notre base de données en utilisant les configurations définies pour notre application Symfony. L’option `--if-not-exists` permet de créer la base de données uniquement si elle n’existe pas.

`docker-compose exec -T $(PHP_SERVICE) bin/console doctrine:database:create --if-not-exists`

## Génération des migrations
La prochaine étape consistait à créer les tables de notre base de données. Afin de générer les migrations qui seront exécutées pour mettre en place la structure de notre base de données, nous avons créé des entités. Elles représentent table de notre base de données et on y configure les colonnes de notre table avec ce qu’on appelle des propriétés de notre entité.

```php
class Tag
{
    use TimestampableEntity;

    use SoftDeleteableEntity;

    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['tag:list', 'doctor:read'])]
    private int $id;

    #[ORM\Column(length: 255)]
    #[Groups(['tag:list', 'doctor:read'])]
    private ?string $name = null;

    #[ORM\ManyToMany(targetEntity: Doctor::class, mappedBy: 'tags')]
    private Collection $doctors;

    public function __construct()
    {
        $this->doctors = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->name;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return Collection<int, Doctor>
     */
    public function getDoctors(): Collection
    {
        return $this->doctors;
    }

    public function addDoctor(Doctor $doctor): self
    {
        if (!$this->doctors->contains($doctor)) {
            $this->doctors->add($doctor);
            $doctor->addTag($this);
        }

        return $this;
    }

    public function removeDoctor(Doctor $doctor): self
    {
        if ($this->doctors->removeElement($doctor)) {
            $doctor->removeTag($this);
        }

        return $this;
    }
}
```

Dans cet extrait de code l’entité Tag représente la table des tags de notre base de données. Les propriétés et les fonctions y sont définies à l’aide des annotations `#[ORM\...]` faisant le lien entre ses propriétés et relations avec les tables et le colonnes de notre base de données. Les annotations et les méthodes sont utilisées en conjonction avec l’ORM (Object-Relational Mapping) pour mapper les objets PHP à la base de données, faciliter les opérations CRUD (création, lecture, mise à jour, suppression et gérer les relations entre les entités).

Pour nos propriétés nous indiquons :
- `id` : un identifiant de type entier généré automatiquement et utilisé comme clé primaire de la base de données. 
    - annotations : `#[ORM\Column]`, `#[ORM\GeneratedValue]` et `#[ORM\Column]`
- name : le nom du tag, représenté par une chaîne de caractères d’une longueur maximale de 255.
    - annotations : `#[ORM\Column(length: 255)]`

Dans notre extrait nous avons une seule relation avec l’entité Doctor. Un tag peut être associé à plusieurs soignantes et une soignante peut avoir plusieurs tags. Cette relation est définie via l’annotation `#[ORM\ManyToMany]`, spécifiant la cible (`Doctor::class`) et l’attribut de mappage (`mappedBy: 'tags'`) pour indiquer que la relation est générée par la propriété tags de l’entité `Doctor`.

Nous avons également des méthodes qui servent à interagir avec les objets Tag et à gérer les relations avec d’autres entités, en particulier l’entité `Doctor` :
- `getDoctors()` : Cette méthode permet d’obtenir la collection de $doctors qui contient tous les objets `Doctor` associés à ce tag.
- `addDoctor(Doctor $doctor)` : Cette méthode permet d’ajouter un objet `Doctor` à la collection $doctors associés à ce tag.
- `removeDoctor(Doctor $doctor)` : Cette méthode permet de supprimer un objet `Doctor` à la collection $doctors associés à ce tag.

Une fois toutes mes entités créées, nous avons généré un fichier de migration qui va traduire toutes mes entités en instruction pour modifier la structure de la base de données.
Pour cette étape nous avons créé deux commandes qui vont nous permettre de :
- La création d’une nouvelle migration en analysant les différences entres les entités de notre application et le schéma de la base de données.
    - `@docker-compose exec -T $(PHP_SERVICE) bin/console make:migration`
- Exécuter toutes les migrations en attente pour mettre à jour le schéma de la base de données en fonction de ces différences
    - `@docker-composeexec-T$(PHP_SERVICE)bin/console doctrine:migrations:migrate -n`

Vous trouverez ci-dessous un extrait du fichier de migration en rapport avec l’entité Doctor et Tag qui a été créer lors du lancement de la première commande.

```php
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221003161344 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE doctor (id INT AUTO_INCREMENT NOT NULL, fee_id INT NOT NULL, created_by_id INT NOT NULL, updated_by_id INT DEFAULT NULL, lastname VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, gender VARCHAR(255) DEFAULT \'undefined\' NOT NULL, status VARCHAR(255) DEFAULT \'pending\' NOT NULL, has_online_appointment TINYINT(1) DEFAULT 0 NOT NULL, private_reason LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, deleted_at DATETIME DEFAULT NULL, INDEX IDX_1FC0F36AAB45AECA (fee_id), INDEX IDX_1FC0F36AB03A8386 (created_by_id), INDEX IDX_1FC0F36A896DBBDE (updated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE tag (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, deleted_at DATETIME DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE doctor_tag (doctor_id INT NOT NULL, tag_id INT NOT NULL, INDEX IDX_EB09AE2C87F4FB17 (doctor_id), INDEX IDX_EB09AE2CBAD26311 (tag_id), PRIMARY KEY(doctor_id, tag_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }
}
```

De cette manière toutes les tables ont été crées, ainsi que la table de jointure reliant un `doctor_id` et un `tag_id`.