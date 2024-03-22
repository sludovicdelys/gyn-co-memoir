---
sidebar_position: 9
---

# Authentification
Nous avons mis en place un système d’authentification qui permet à utilisateur et utilisatrice avec un rôle **ADMIN** et/ou **SUPER ADMIN** de se connecter avec son adresse e-mail et son mot de passe; pour ensuite accéder et interagir avec le back-office de notre application.

## Générer l'entité User
En première étape nous avons utilisé la commande `make:user` du Maker Bundle pour générer l’entité User, le repository associé, les fichiers de tests et la migration pour créer la
table utilisateur dans la base de données.
La classe générée contient des méthodes qui seront nécessaires à la mise en place du système d’authentification de Symfony comme `getRoles()` et `eraseCredentials()`.

```php
<?php

namespace App\Entity;

use App\Doctrine\UserListener;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;
use Gedmo\Timestampable\Traits\TimestampableEntity;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\EntityListeners([UserListener::class])]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt', timeAware: false)]
#[UniqueEntity(fields: ['email'], message: 'There is already an account with this email')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use TimestampableEntity;

    use SoftDeleteableEntity;

    public const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
    public const ROLE_ADMIN = 'ROLE_ADMIN';

    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private int $id;

    #[ORM\Column(length: 180, unique: true)]
    private string $email;

    #[ORM\Column(length: 255)]
    private string $lastname;

    #[ORM\Column(length: 255)]
    private string $firstname;

    #[ORM\Column]
    protected array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private string $password;

    #[ORM\Column(type: 'boolean')]
    private bool $isVerified = false;

    #[ORM\OneToMany(mappedBy: 'createdBy', targetEntity: Doctor::class)]
    private Collection $doctors;

    #[ORM\OneToMany(mappedBy: 'processedBy', targetEntity: Comment::class)]
    private Collection $comments;

    public function __construct()
    {
        $this->doctors = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->roles = [];
    }

    public function __toString(): string
    {
        return $this->firstname.' '.$this->lastname;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = self::ROLE_ADMIN;

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): self
    {
        $this->lastname = strtoupper($lastname);

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): self
    {
        $this->firstname = ucfirst($firstname);

        return $this;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): self
    {
        $this->isVerified = $isVerified;

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
            $doctor->setCreatedBy($this);
        }

        return $this;
    }

    public function removeDoctor(Doctor $doctor): self
    {
        if ($this->doctors->removeElement($doctor)) {
            // set the owning side to null (unless already changed)
            if ($doctor->getCreatedBy() === $this) {
                $doctor->setCreatedBy(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Comment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): self
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setProcessedBy($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): self
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getProcessedBy() === $this) {
                $comment->setProcessedBy(null);
            }
        }

        return $this;
    }

//    /**
//     * @return string
//     */
//    public function getPlainPassword(): string
//    {
//        return $this->plainPassword;
//    }
//
//    /**
//     * @param string $plainPassword
//     */
//    public function setPlainPassword(string $plainPassword): void
//    {
//        $this->plainPassword = $plainPassword;
//        $this->password = null;
//    }
}
```

## Configurer le système d'authentification
Après avoir généré et exécuter les migrations pour créer la table de l’utilisateur dans la base de données, nous avons utilisé la commande make:auth du Maker Bundle pour générer automatiquement une configuration de base pour le système d’authentification dans le fichier `security.yaml`. Voici une liste des éléments importants de ce fichier :
- `password_hashers` : dans cette section on spécifie comment les mots de passe des utilisateurs sont hachés. Par défaut, Symfony utilise l’algorithme bcrypt pour le hachage de mots de passe.
- `providers` : dans cette section on définit le fournisseur d’utilisateurs utilisés pour charger les utilisateurs et utilisatrice venant de la base de données. Le fournisseur est donc basé sur l’entité `User` et les utilisateurs et utilisatrices sont chargés en utilisant la propriété `email` comme identifiant.
- `firewalls` : dans cette section on définit les stratégies d’authentification pour différentes parties de notre application. Notamment, le pare-feu `main` gère l’authentification principale de l’application via un formulaire (`form_login`), en spécifiant le fournisseur d’utilisateurs à utiliser et en activant la protection CSRF: Cross-Site Request Forgery (`enable_csrf: true`). Il spécifie également un point d’entrée (`entry_point`) pour rediriger les utilisateurs vers la page de connexion en cas d’accès non autorisé. Nous spécifions également que nous souhaitons utiliser une méthode d’authentification personnalisée (`custom_authenticator`) en lui passant la classe `LoginFormAuthenticator`.

```yml
security:
    # https://symfony.com/doc/current/security.html#registering-the-user-hashing-passwords
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface: 'auto'
    # https://symfony.com/doc/current/security.html#loading-the-user-the-user-provider
    providers:
        # used to reload user from session & other features (e.g. switch_user)
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        main:
            lazy: true
            form_login:
                provider: app_user_provider
                enable_csrf: true
            entry_point: form_login
            custom_authenticator: App\Security\LoginFormAuthenticator
            logout:
                path: app_logout
                # where to redirect after logout
                target: app_login

            # activate different ways to authenticate
            # https://symfony.com/doc/current/security.html#the-firewall

            # https://symfony.com/doc/current/security/impersonating_user.html
            # switch_user: true
    role_hierarchy:
        ROLE_ADMIN: ROLE_ADMIN
        ROLE_SUPER_ADMIN: [ ROLE_ADMIN ]

    # Easy way to control access for large sections of your site
    # Note: Only the *first* access control that matches will be used
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
```

## Mise en place d'une authentification personnalisée
Comme énoncé précédemment, nous avons implémenté une classe personnalisée `LoginFormAuthenticator` pour gérer le processus d’authentification lorsque les utilisateurs et utilisatrices se connectent au back-office de notre application.
Notre méthode `authenticate` est appelée lorsqu’un utilisateur soumet le formulaire de connexion. Cette dernière, récupère les informations fournies dans la requête (`email`, `password`, et `_csrf_token`) et encapsulent ces informations dans un objet `Passport`. Ce dernier est ensuite renvoyé pour être utilisé lors de la tentative d’authentification, c’est ici que le serveur vérifie la validité du token jeton CSRF en comparant sa valeur avec celles stockées en session de l’utilisateur. Si les valeurs ne correspondent pas, la requête sera considérée comme étant une attaque CSRF et sera rejetée.
Lorsque l’authentification est réussie la méthode `onAuthenticationSuccess` est appelée et redirige l’utilisateur vers la page de destination prévue.

```php
class LoginFormAuthenticator extends AbstractLoginFormAuthenticator
{
    use TargetPathTrait;

    public const LOGIN_ROUTE = 'app_login';

    public function __construct(private readonly UrlGeneratorInterface $urlGenerator)
    {
    }

    public function authenticate(Request $request): Passport
    {
        $email = $request->request->get('email');
        $password = $request->request->get('password');
        $csrfToken = $request->request->get('_csrf_token');

        return new Passport(
            new UserBadge($email),
            new PasswordCredentials($password),
            [
                new CsrfTokenBadge('authenticate', $csrfToken),
            ]
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        if ($targetPath = $this->getTargetPath($request->getSession(), $firewallName)) {
            return new RedirectResponse($targetPath);
        }

        return new RedirectResponse($this->urlGenerator->generate('admin'));
    }

    protected function getLoginUrl(Request $request): string
    {
        return $this->urlGenerator->generate(self::LOGIN_ROUTE);
    }
}
```

# Autorisations

Dans notre fichier de configuration `security.yaml` du framework Symfony, nous avons défini des règles pour sécuriser les routes de notre back-office
Premièrement, nous définissons la hiérarchie des rôles de notre application dans le champ `role_hierarchy`. Les rôles `ROLE_ADMIN` et `ROLE_SUPER_ADMIN` y sont définis et nous assignons également le rôle **ADMIN** au **SUPER ADMIN**.

```yml
role_hierarchy:
        ROLE_ADMIN: ROLE_ADMIN
        ROLE_SUPER_ADMIN: [ ROLE_ADMIN ]
```

Ensuite nous configurons l’accès à certaines parties de notre application en fonction des rôles utilisateurs et utilisatrices dans le champ access_control. Si un utilisateur tente d’accéder à une route du back-office sans être authentifié, il sera redirigé sur la page login.

```yml
access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
```

Nous avons également mis en place une configuration qui permet de restreindre l’accès à la gestion des utilisateurs dans le back-office en précisant que seuls les utilisateurs ayant le rôle `ROLE_SUPER_ADMIN` auront accès à l’entité `USER` dans le système d’administration EasyAdminBundle.

```php
class UserCrudController extends AbstractCrudController
{
    use FlashMessageTrait;

    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityPermission(User::ROLE_SUPER_ADMIN)
            ->setEntityLabelInSingular('User')
            ->setEntityLabelInPlural('Users');
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            TextField::new('lastname'),
            TextField::new('firstname'),
            TextField::new('email'),
            TextField::new('password')->setFormType(PasswordType::class)->onlyOnForms(),
            ChoiceField::new('roles')->setChoices(
                [
                    User::ROLE_ADMIN => User::ROLE_ADMIN,
                    User::ROLE_SUPER_ADMIN => User::ROLE_SUPER_ADMIN,
                ]
            )->allowMultipleChoices(),
            DateTimeField::new('createdAt')->onlyOnDetail(),
        ];
    }
}
```