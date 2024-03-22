---
sidebar_position: 4
---

# Spécifications fonctionnelles

## MVP - Fonctionnalités attendues et diagrammes

### Détails des fonctionnalités

#### Lister les soignants
Sur le site actuel, les fiches complètes des soignants et soignantes sont générées par ordre de publication. Pour continuer de parcourir la liste, l'utilisateur ou l’utilisatrice doit sélectionner le bouton “Articles précédents”.
Cependant il est recommandé d’utiliser un système de pagination pour permettre à l’utilisateur ou l’utilisatrice de naviguer entre les différentes pages d’une liste d’éléments.

#### Filtrer les soignants par profession, par catégories, par langues
Filtrer les soignants par profession, par catégories, par langues
Sur le site actuel, un utilisateur ou une utilisatrice peut rechercher en sélectionnant qu'un seul critère; une catégorie ou une étiquette. Les catégories représentent les actes médicaux que le soignant et la soignante pratiquent. Les étiquettes représentent une approche médicale positive vécue par une personne lors d’un entretien avec un soignant ou une soignante.
La mise en place d’une recherche multicritères est indispensable pour les personnes qui visitent la plateforme de Gyn&Co. Ce système permet d’effectuer une recherche personnalisée, permettant aux personnes de trouver un soignant ou une soignante qui correspond à leurs besoins.

#### Recommander un soignant ou une soignante
Un visiteur ou une visiteuse peut recommander un soignant et une soignante qui administrent des soins gynécologiques de manière respectueuse. Sur le site actuel de Gyn&Co la recommandation se fait sur un long formulaire à une page, qui présente de nombreux inconvénients. Afin de faciliter la recommandation d’un soignant et d’une soignante nous avons mis en place sur un formulaire en plusieurs étapes.

#### Administration du registre des soignants et des soignantes
L’administration des soignants n’était pas une tâche facile sur le site Wordpress de Gyn&Co. Lorsqu’un visiteur ou une visiteuse prenait le temps d’effectuer la recommandation d’un soignant ou d’une soignante, un email anonyme était envoyé à l’adresse du collectif. Après avoir minutieusement analysé la demande de recommandation, l’administrateur et l'administrateur entamait la longue tâche de reporter tout le contenu de l’email sur un article Wordpress.

Dans le but de simplifier le travail des administrateurs et administratrices, nous avons mis en place un back-office qui s’occupera de la gestion du registre des soignants et soignantes. Plusieurs tâches pourront être effectuées avec aise grâce au gestionnaire:
* Authentification
* Consulter la liste des soignants et soignantes avec une
* pagination
* Filtrer les soignants et soignantes par statut public ou privé
* Rechercher un soignant ou une soignante avec un menu déroulant
* Gérer la persistance des données (CRUD) pour
    - les soignants et les soignantes
    - les catégories
    - les professions
* Consulter les recommandations en attente
* Approuver une recommendation

#### Gestion des administrateur et administratrices
Nous avons également mise en place un rôle de super-administrateur et super administratrice afin de pouvoir effectuer plusieurs actions tels que:
* Ajouter un administrateur et une administratrice
* Attribuer des droits à un administrateur et une administratrice
* Consulter la liste des administrateurs et administratrices
* Supprimer un administrateur et une administratrice

### Diagramme de cas d’utilisation
Le diagramme de cas d’utilisations permet de représenter l’ensemble des événements qui se produisent entre notre système et les utilisateurs ou utilisatrices. Intrinsèquement, le diagramme de cas d’utilisation est une description visuelle des différentes actions que la personne peut effectuer sur notre plateforme et représente les fonctionnalités attendues.

[Diagramme de cas d'utilisations](/img/diagramme_use_cases.png)

## Fonctionnalités futures 

* Permettre à un visiteur et visiteuse de laisser un commentaire sur la fiche d’un soignant ou d’une soignante.
* Permettre à un visiteur et visiteuse de consulter le contenu avec un mode sombre.
* Formulaire de contact - permettre à un visiteur et une visiteuse de contacter le collectif.
* Statistiques du back office - permettre à l’administrateur et l'administratrice de surveiller l’activité de la plateforme.
* Permettre à l’administrateur et l’administrateur de supprimer un soignant ou une soignante qui n’a pas été approuvée au bout d’un certain temps.
* Informer un visiteur et une visiteuse que la recommandation soumise a été validée par un administrateur ou une administratrice.
* Permettre à un visiteurs ou une visiteuse de créer un compte afin de retrouver ses soignants favoris, ses recommandations et ses commentaires
* Rédiger un onboarding du site web pour guider le parcours de l’utilisateur et l’utilisatrice
* Proposer des soignants et soignantes “similaires” en pied de fiche.
* Trouver un soignant ou une soignante à proximité à l’aide de la géolocalisation
