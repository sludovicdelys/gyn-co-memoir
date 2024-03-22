---
sidebar_position: 5
---

# Spécifications techniques

## Architecture N-Layers

Le projet Gyn&Co a été construit en pensant au modèle de l’architecture N-layers (ou N-tiers). Dans ce type d’architecture l’application est divisée en trois couches logiques distinctes, cela améliore la flexibilité, la maintenance, et la scalabilité de l’application:

1. **Présentation**

La couche présentation gère l’interface et les intéractions qui y sont faites par les utilisateurs et les utilisatrices. Le site public est implémenté avec Next JS et Material MUI. Pour le back office, nous avons utilisé Twig.

2. **Application**

La couche présentation gère les opérations complexes telles que la validation de données venant de la couche présentation, communiquer avec la couche de données, gérer les erreurs, etc. Nous avons implémenté le backend avec Symfony, l’ORM de Doctrine, EasyAdmin et API Platform. Nous avons également utilisé l’API de Google Maps Geocoding

3. **Données**

La couche données gère la persistance et la gestion de notre base de données SQL.

## Front-end

**Twig**

Twig est un moteur de template intégré au framework Symfony qui permet d’inclure du code PHP dans des pages générées en HTML.

**Next.js**

Next.js est un framework de développement JavaScript React qui permet de construire des applications web statiques, performantes et adaptées au référencement. Il fournit des fonctionnalités telles que la gestion des routes, le pré-rendu côté serveur, et la mise en cache automatique.

**Material UI**

Material UI est une bibliothèque de composants React basée sur le principe de Material Design de Google. Le Material Design de Google est un système de design conçu pour maintenir un cadre de conception cohérent et intuitif afin de créer des applications web avec une interface utilisateur cohérente.

**Axios**

Afin d’effectuer des requêtes entre notre application cliente Next.js et API Platform et récupérer les différentes étapes du formulaire j’ai utilisé Axios car c’est une bibliothèque JavaScript simple à utiliser pour effectuer des requêtes HTTP. On peut également gérer des requêtes asynchrones pour ne pas bloquer l’utilisateur et utilisatrice de notre application et on peut gérer facilement les erreurs renvoyées par l’API comme les erreurs de validation.

**TypeScript**

TypeScript est un langage de programmation développé par Microsoft qui a pour but d’améliorer et de sécuriser la production de code JavaScript. Il peut être vu comment une version “typé” du JavaScript. Il va nous permettre de réduire les erreurs de programmation et améliorer la lisibilité et la maintenabilité de notre code avant qu’il soit exécuté.

## API 

**API Platform**

API Platform est un framework de développement PHP qui permet une mise en place simple et rapide d’une API REST et GraphQL, en se basant sur une architecture MVC. La partie serveur est écrite en PHP tandis que la partie client est écrite en Javascript et Typescript.

**API Google Maps Geocoding**

L’API Google Maps Geocoding est utilisée pour convertir des adresses en coordonnées géographiques (latitude et longitude) que nous pourrions utiliser pour placer des repères sur une carte intéractive.

## Back-end

**MySQL**

MySQL est un système de gestion de bases de données relationnelles utilisant le langage de programmation SQL.

**Symfony**

Symfony est un framework de développement PHP avec une architecture MVC qui contient un ensemble de composants réutilisables. Il facilite la gestion de nombreuses tâches telles que les requêtes et réponses HTTP, le routage, les formulaires, la validation des données, la sécurité, l’accès à la base de données, etc.

**Doctrine ORM**

Doctrine est l’ORM (Object Relational Mapping) par défaut du framework Symfony, il opère dans la couche d’abstraction à la base de données et accède à ses données en utilisant des objets PHP.

**EasyAdmin**

EasyAdmin est un bundle pour Symfony qui permet de mettre en place un back-office d’administration. Il utilise Twig pour générer l’interface en HTML.

## CI/CD

**Docker**

Docker est une plateforme permettant d’empaqueter et distribuer des applications dans des conteneurs logiciels. L’application et ses dépendances peuvent être exécutées sur n’importe quel serveur, cela garantit que l’application fonctionnera sur n’importe quel ordinateur. Dans le cadre de Gyn&Co, Docker nous permet de faciliter la création, le déploiement et l'exécution de notre application dans Github Actions grâce à ses conteneurs.

**Github Actions**

Github Actions est une plateforme d’intégration continue et livraison continue (CI/CD) intégrée à GitHub et qui permet d’automatiser les workflows de développement. Dans le cadre de Gyn&Co, les actions sont définies par des commandes Docker pour lancer une image, exécuter des tests ou déployer notre application. Il y a également des tâches liées à la gestion de paquets, à la vérification de la qualité du code et l'exécution de tests unitaires.

**PHPStan**

PHPStan est un outil d’analyse statique qui détecte automatiquement les erreurs dans le code PHP.

**PHPUnit**

PHPUnit est un framework de test unitaires dédié au langage de programmation PHP. Les tests unitaires permettent de détecter les éventuelles régressions et assurent que le code s'exécute comme prévu.

**ESLint**

C’est un outil d’analyse de code statique JavaScript qui permet d’identifier des erreurs et des problèmes dans la qualité de code.

**Prettier**

Prettier est un outil de formatage de code qui modifie automatiquement le code pour qu’il soit plus lisible et cohérent.