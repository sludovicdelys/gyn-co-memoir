---
sidebar_position: 6
---

# Conception de la base de données
La conception de notre base de données a été mise en place selon la méthode Merise qui fournit des directives et des techniques pour structurer la conception de l’application. Elle comprend notamment la modélisation des données à l’aide d’un schéma entité-relation, du dictionnaire de données et du modèle physique des données (MPD).

## Schéma entité-association
Généralement élaboré dans les premières étapes de la conception, le schéma entité-association se focalise principalement sur la représentation graphique des entités, de leurs attributs et des relations entre les différentes entités de notre application. Il fournit une vision conceptuelle claire et aide à d’identifier les principales entités et leurs relations.

[Schéma entité-association](/img/gynco_er.png)

## Dictionnaire de données
Accompagnant le schéma entité-association, le dictionnaire de données est rédigé afin de mettre en place une description détaillée des entités, attributs, relations et les contrainte du système. Il document les définitions, les types de données, la longueur des champs, les clés primaires, les clés étrangères, etc. Il garantit la cohérence et la compréhension des données manipulées dans l’application.

[Dictionnaire de données](/img/dictionnaire_donnees.pdf)

## Modèle physique des données (MPD)
Le MPD représente la structure concrète des données dans la base de données ainsi que les tabes, les colonnes, les clés, les contraintes d’intégrité, etc. Il est spécifique au système de gestion de base de données utilisé et optimise la représentation de celles-ci.

[Modèle physique des données](/img/gynco_mpd.png)