import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Présentation',
    description: (
      <>
        Gyn&Co est une organisation à but non lucratif, qui est sensible aux inégalités importantes et
        aux difficultés d'accès aux services et accompagnements que les femmes, transsexuelles ou
        personnes intersexuées rencontrent dans le domaine de la gynécologie médicale.
      </>
    ),
  },
  {
    title: 'Objectif',
    description: (
      <>
        L’objectif du projet est de créer un nouveau site pour le collectif Gyn&Co afin de pouvoir
        ajouter des nouvelles fonctionnalités qui permettent d’améliorer l’expérience des utilisateurs
        et utilisatrices, augmenter le trafic et faciliter la gestion administrative de la liste des
        soignants et des soignantes.
      </>
    ),
  },
  {
    title: 'Besoins',
    description: (
      <>
        <ol>
          <li>Créer un site soigné et accessible qui permet au collectif d’administrer leur registre de soignants et soignantes.</li>
          <li>Permettre aux utilisateurs et utilisatrices d’effectuer une recherche multi-critères.</li>
          <li>Faciliter l’expérience utilisateurs et utilisatrices grâce à un formulaire intéractif.</li>
        </ol>
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
