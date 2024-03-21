---
sidebar_position: 2
---

# Le cahier des charges

## Les objectifs, les besoins

Après avoir consulté le product owner, nous avons établi que notre mission est de créer une
plateforme informative et collaborative pour les usagers et usagers de soins gynécologiques.
De ce fait, il faut que l’utilisateur ou l’utilisatrice puisse trouver un soignant ou une soignante
en gynécologie avec aise. En permettant à des patients et patientes de bénéficier d'une
approche médicale respectueuse, le collectif remplit sa mission de lutter contre les violences
gynécologiques et obstétriques.

## Le public visé

Gyn&Co s’adresse aux:
- personnes qui souhaitent bénéficier de soins gynécologiques avec des soignants et
soignantes empathiques et respectueux.
- personnes qui souhaitent collaborer à son évolution en recommandant un soignant ou
une soignante, et en laissant un avis.
- administrateurs et administratrices qui souhaitent gérer les soignants et soignantes,
leurs actes médicaux et les commentaires qui leur sont assignés.

## Rôle utilisateurs/utilisatrices

1. Les utilisateurs et utilisatrices non authentifiés
- USER : les visiteurs et visiteuses qui peuvent soumettre une recommandation et accéder au registre des soignants et soignantes

2. Les utilisateur et utilisatrices authentifiés
- ADMIN : les membres du collectif qui gère l’administration de la plateforme
- SUPER ADMIN : Les membres du collectif qui gèrent l’administration de la
plateforme et de ses membres.

## User stories

Dans l’intention de clarifier et décrire les besoins et les attentes des utilisateurs et utilisatrices du collectif Gyn&Co nous avons rédigé un tableau qui regroupe les user stories. Ce tableau nous a permis d’assurer que nous développons des fonctionnalités qui sont vraiment utiles à l’utilisateur et nous a servi de base pour planifier et prioriser la gestion du développement. Nous avons utilisé Google Sheets pour la réalisation du tableau des user stories.

[Tableau des user stories de Gyn&Co](/img/user-stories.png)

## Accessibilité

Le site public du projet Gyn&Co a été conçu avec un design responsive, de ce fait le site
s'adapte à toutes les résolutions d’écrans et les utilisateurs et utilisatrices peuvent le consulter
sur un téléphone portable, une tablette, un ordinateur portable ou un sur un moniteur.
Néanmoins, le gestionnaire administratif ne sera pas responsive.

Nous tenions également à faciliter la recommandation d’un soignant•e grâce à un formulaire
en plusieurs étapes.
Cette conception permet de réduire la charge cognitive de l’utilisateur et l’utilisatrice, car la
surcharge de questions à répondre est découpée en plusieurs étapes.
L’utilisateur et l’utilisatrice peuvent connaître leur progression dans le formulaire à l’aide
d’une pagination, conserver les données renseignées sur chaque étape et naviguer entre les
différentes étapes jusqu’à la soumission du formulaire.

## Search Engine Optimization

Dans le cadre de Gyn&Co il était important d’améliorer le référencement naturel (SEO) pour
plusieurs raisons:
- Améliorer la visibilité en ligne en améliorant le classement de notre site dans les
résultats de recherche, ce qui augmente notre visibilité auprès d’un public demandeurs
et demandeuses de soins gynécologiques respectueux.
- Améliorer l’expérience utilisateur en apportant une navigation plus rapide et un
contenu plus structuré.
- Un bon classement renforce la crédibilité de Gyn&Co et de ce fait renforce la
confiance des utilisateurs et utilisatrices.

C’est pour accomplir cet objectif que nous avons décidé d’ajouter Next.js à notre liste de
technologies pour développer la partie front-end de notre application. Next.js est un
framework Javascript qui est reconnu comme étant performant en termes de référencement
naturel (SEO). Il contient plusieurs fonctionnalités qui permettent d’améliorer le
référencement:
- Server-side rendering (SSR): A chaque chargement de page le contenu de notre site
est généré depuis le serveur et ensuite renvoyé aux navigateurs en HTML. Par
conséquent, les pages se chargent plus rapidement
- Métadonnées et en-têtes HTTP: Avec le framework, on peut fournir les métadonnées
de la page et faciliter la compréhension du contenu de notre page pour les moteurs de
recherche.

## Arborescences 

Grâce à notre tableau des user stories, nous avons pu identifier les différents rôles utilisateurs et utilisatrices de notre application. Cette étape nous a permis de représenter graphiquement les relations hiérarchiques entre les différents éléments de la plateforme Gyn&Co. Nous avons utilisé Whimsical pour la réalisation des schémas.

[Arborescence du site public de Gyn&Co](/img/arborescence-public.png)

[Arborescence du back-office de Gyn&Co](/img/arborescence-back-office.png)

## Wireframes

Nous avons ensuite réalisé des wireframes détaillées pour planifier et concevoir l'esthétique et la structure de l'expérience utilisateur et utilisatrice sur notre application. Ils nous permettent d’avoir une vue d’ensemble des éléments clés de l’interface, des intéractions, de la navigation et des fonctionnalités. Nous avons utilisé Whimsical pour la réalisation des wireframes. 

Lors du développement nous avons rencontré des défis de développement et des changements de besoins qui ont affecté l'exactitude graphique entre l’application et les wireframes. Notamment nous avons rencontré des difficultés à concevoir des composants sur mesure avec Material UI qui est une bibliothèque de composants React open-source. Dans une évolution future de Gyn&Co nous utiliserons Tailwind CSS pour customiser votre code plus facilement. 
Cependant nos wireframes n’ont pas été futiles, car elles nous ont servi de guide pour la réalisation de l’application et pour effectuer des ajustements qui s’adaptent aux capacités techniques et aux besoins en matière d’expérience utilisateur. 

[Wireframe de la recommendation d'un(e) soignant(e)](/img/wireframe_recommendation.png)

[Wireframe des recommandations archivées du back-office](/img/wireframe_recommendations_bo.png)