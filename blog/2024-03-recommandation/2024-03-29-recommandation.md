---
slug: recommandation
title: Réalisations - La recommandation
authors: [sabrina]
tags: [recommandation, gyn&co, formulaire]
---
La page "**À propos**" du site WordPress de [Gyn&Co](https://gynandco.wordpress.com/) introduit le collectif, son histoire, sa mission, et le processus de recommandation, accessible via un lien direct ou le menu de navigation.

Cependant, la page de recommandation, qui nécessite le remplissage d'un formulaire long et visuellement peu engageant, peut décourager les utilisateurs en raison de son volume d'informations à saisir et de l'absence de vérification en temps réel, risquant ainsi de limiter les contributions à la communauté pour des soins gynécologiques respectueux.

## Aperçu du back-end et génération des champs de saisi

### La base de données 
La base de données SQL de Gyn&Co utilise une table `section` pour structurer les étapes du formulaire, à l'exception de celle dédiée aux informations sur le soignant. Les questions du formulaire permettent des réponses via deux types de champs: cases à cocher et boutons radios, ces derniers étant actuellement utilisés exclusivement.

Les options de réponse varient selon la question, organisées en quatre groupes distincts dans une table dédiée:
- "Oui - Non"
- "Oui - Non - Non concernée"
- "Oui - Non - Parfois"
- "Très bonne - Bonne - Passable".

[Modèle physique des données](/img/gynco_mpd.png)

### Les entités Doctrine 
Dans le projet Gyn&Co, l'équipe utilise l'ORM Doctrine de Symfony pour créer et gérer sa base de données, tirant parti de ses avantages tels que la modélisation des bases de données en termes d'entités, ce qui simplifie le développement. Ces entités, représentant les tables, permettent de définir les propriétés des bases de données et de gérer les relations entre elles. Doctrine élimine le besoin d'écrire du SQL pour les opérations CRUD et renforce la sécurité contre les injections SQL. 

La création d'une entité Doctrine comprend plusieurs étapes :

1. la création d'un fichier d'entité (manuellement ou via commande). 
2. la définition des propriétés via annotations, l'ajout de relations entre entités
3. la mise à jour de la base de données avec les configurations d'entité, et finalement
4. l'implémentation de la logique métier pour gérer les données

Prenons l'exemple de notre entité `SurveyOptionGroup` : 

1. Avec la commande `symfony console make:entity SurveyOptionGroup`. Cette commande créera un fichier d’entité vide qu’il faudra compléter.
2. Sur notre entité `SurveyOptionGroup` les propriétés représentent les colonnes de la table associée.
3. Notre entité `SurveyOptionGroup` possède deux relations: une  `Many To Many` avec l’entité `SurveyOptionChoice` et une `One To Many` avec l’entité `SurveyQuestion`.
4. Lorsque notre entité est configurée, nous pouvons exécuter la commande `php bin/console doctrine:schema:update —force` pour mettre à jour la base de données.
5. En dernier lieu, nous définissions des méthodes pour effectuer des opérations CRUD sur notre base de données; nous implémentons la logique métier.

```php title="/src/Entity/SurveyOptionGroup.php"
class SurveyOptionGroup
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['survey:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['survey:read'])]
    private ?string $name = null;

    #[ORM\ManyToMany(targetEntity: SurveyOptionChoice::class, mappedBy: 'optionGroup', cascade: ['persist', 'remove'])]
    #[Groups(['survey:read'])]
    #[SerializedName('choices')]
    private Collection $surveyOptionChoices;

    #[ORM\OneToMany(mappedBy: 'optionGroup', targetEntity: SurveyQuestion::class)]
    private Collection $surveyQuestions;

    public function __toString(): string
    {
        return $this->name;
    }

    public function __construct()
    {
        $this->surveyOptionChoices = new ArrayCollection();
        $this->surveyQuestions = new ArrayCollection();
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
     * @return Collection<int, SurveyOptionChoice>
     */
    public function getSurveyOptionChoices(): Collection
    {
        return $this->surveyOptionChoices;
    }

    public function addSurveyOptionChoice(SurveyOptionChoice $surveyOptionChoice): self
    {
        if (!$this->surveyOptionChoices->contains($surveyOptionChoice)) {
            $this->surveyOptionChoices->add($surveyOptionChoice);
            $surveyOptionChoice->addOptionGroup($this);
        }

        return $this;
    }

    public function removeSurveyOptionChoice(SurveyOptionChoice $surveyOptionChoice): self
    {
        if ($this->surveyOptionChoices->removeElement($surveyOptionChoice)) {
            $surveyOptionChoice->removeOptionGroup($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, SurveyQuestion>
     */
    public function getSurveyQuestions(): Collection
    {
        return $this->surveyQuestions;
    }

    public function addSurveyQuestion(SurveyQuestion $surveyQuestion): self
    {
        if (!$this->surveyQuestions->contains($surveyQuestion)) {
            $this->surveyQuestions->add($surveyQuestion);
            $surveyQuestion->setOptionGroup($this);
        }

        return $this;
    }

    public function removeSurveyQuestion(SurveyQuestion $surveyQuestion): self
    {
        if ($this->surveyQuestions->removeElement($surveyQuestion)) {
            // set the owning side to null (unless already changed)
            if ($surveyQuestion->getOptionGroup() === $this) {
                $surveyQuestion->setOptionGroup(null);
            }
        }

        return $this;
    }
}
```
#### API Platform 
L'équipe de Gyn&Co a opté pour la création d'une API REST via API Platform pour faciliter l'intégration front-end grâce à l'ORM Doctrine, permettant ainsi une communication efficace avec la base de données. API Platform facilite la création d'un CRUD en automatisant la conversion des données entre les formats adaptés au front-end et ceux requis par Doctrine pour les opérations de base de données, grâce à la normalisation (conversion des données pour les requêtes de base de données) et à la dénormalisation (adaptation des données pour les réponses HTTP). Un aspect clé de ce processus est la définition de contextes de sérialisation, qui organisent les données en groupes d'attributs pour mieux contrôler les informations renvoyées par l'API, permettant une personnalisation selon les exigences spécifiques du client.

```php title="/src/Entity/SurveyOptionGroup.php"
#[ORM\Entity(repositoryClass: SurveyOptionGroupRepository::class)]
#[UniqueEntity(fields: ['name'], message: 'Ce groupe de réponse existe déjà.')]
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/options/{id}',
            openapiContext: [
                'summary' => '✅ Get an Option Group.',
                'description' => '<b>EN</b> – Retrieves a survey’s option group.<br><b>FR</b> – Retourne un groupe de choix de réponse.',
            ],
            normalizationContext: ['groups' => ['optionGroup:read']],
        ),
    ],
    routePrefix: '/survey'
)]
```
## API Platform et l’application cliente Next.js

### Configuration
Avant de pouvoir effectuer des requêtes sur notre API REST Platform distante, il y avait deux étapes importantes à effectuer:
* Mise en place et lancement du back-end 

Premièrement, j’ai cloner le dépôt distant qui représente notre application back-end pour pouvoir l’utiliser sur ma machine en local. Ensuite, je lance la commande `docker-compose up -d –build` qui indique à Docker Compose d’aller lire le fichier `docker-compose.yml`, construite les images pour chaque service indiquée dans ce fichier et lance les conteneurs pour chaque service.
* Variables d’environnements

Pour se connecter à notre API back-end  depuis notre projet front-end, j’ai rédigé un fichier de configuration `.env.local` dans lequel j’ai renseigné une variable d’environnement `NEXT_PUBLIC_ENDPOINT_API`qui contient l’URL de mon l’API que j’ai lancer en local.
Je peux maintenant lire cette variable d’environnement dans mon code pour faire des requêtes et récupérer les données pour générer la structure de mon formulaire de recommandation.  

### Axios
Pour installer Axios et pouvoir l’utiliser dans mon application Next.js j’ouvre mon terminal et exécute la commande suivante: `yarn install axios`. 

Voici un extrait de code représentant des requête axios réalisées pendant ma formation dans le cadre du projet d'apothéose : 

```jsx title="/src/Entity/SurveyOptionGroup.php"
// Axios
import axios from 'axios';

{...}

// Next
import type { NextPage, GetStaticProps } from 'next';


{...}

type PropsType = {
  sections: TSection[],
  specialties: TMedicalSpecialty[],
  fees: TFee[],
  name: string | null
}

// Fetch Data from API Call
export const getStaticProps: GetStaticProps = async () => {
  const sections = await axios.get(process.env.NEXT_PUBLIC_ENDPOINT_API + 'survey/sections', {
    headers: {
      'accept': 'application/json'
    },
  });

  // Fetch Specialties
  const specialties = await axios.get(process.env.NEXT_PUBLIC_ENDPOINT_API + 'specialties', {
    headers: {
      'accept': 'application/json'
    },
  });

  // Fetch Fees
  const fees = await axios.get(process.env.NEXT_PUBLIC_ENDPOINT_API + 'fees', {
    headers: {
      'accept': 'application/json'
    },
  });

  return {
    props: {
      sections: sections.data,
      specialties: specialties.data,
      fees: fees.data,
    }
  };
};
```

Dans cet extrait, l'utilisation d'Axios pour effectuer des requêtes HTTP est mise en avant dans le contexte d'une application Next.js, où `getStaticProps` joue un rôle crucial. Cette fonction s'exécute durant l'étape de build pour récupérer des données d'un CMS, qui sont ensuite intégrées au HTML statique de chaque page, rendant le contenu adapté pour du SEO et des performances optimales. 

Elle est spécialement recommandée pour des pages nécessitant du contenu statique qui dépend de requêtes API. Pour gérer dynamiquement le contenu basé sur l'interaction de l'utilisateur ou des données changeantes, `getStaticProps` et `getServerSideProps` sont utilisés. 

Les fonctions font appel à Axios pour récupérer les données des sections spécifiques du formulaire via l'API, illustre une mise en œuvre pratique. L'utilisation d'asynchronicité avec `getStaticProps` assure que le contenu de la page n'est généré qu'après la réception et le traitement des données nécessaires de l'API, démontrant ainsi l'intégration efficace des appels API externes dans le processus de génération de pages statiques de Next.js.

## Utilisation de Next.js avec TypeScript
L'association de TypeScript avec Next.js pour typer les réponses d'une API distante est une démarche cruciale qui améliore significativement la qualité du code en renforçant la sûreté de type. Cette approche minimise les erreurs de programmation et garantit que les données sont manipulées de manière appropriée. Voici les étapes typiques à suivre pour implémenter un tel système :

### Définir des types pour les données provenant de l’API 
La création d'un dossier `types` avec un fichier `index.tsx` pour définir les types de données dans un projet TypeScript est une pratique courante pour organiser et typer de manière explicite les données manipulées, particulièrement lorsqu'elles proviennent d'API distantes. Dans l'extrait mentionné, deux interfaces, `TSection` et `TRecommendationType`, sont définies pour structurer et typer les données relatives aux différentes étapes d'un formulaire de recommandation.

L'interface `TSection` sert à décrire le format des données de recommandation reçues de l'API, comprenant des propriétés telles que title, description, et questions, chacune typée pour refléter la nature des données attendues. Pour la propriété questions, l'utilisation du type `Array` indique que TypeScript doit s'attendre à un tableau d'objets, où le typage est étendu aux propriétés internes de ces objets, y compris `inputType` et `options`, assurant ainsi que les données reçues et manipulées correspondent aux attentes en termes de structure et de format.

De manière similaire, l'interface `TRecommendationType` est utilisée pour définir le schéma des données envoyées à l'API lors de la soumission du formulaire. Cette approche permet une gestion des types cohérente et sécurisée à la fois pour les données entrantes et sortantes, garantissant que les interactions avec l'API respectent les contrats de données établis et facilitant le développement et la maintenance du projet en offrant une clarté sur la 
structure des données échangées.

```typescript jsx title="/types/index.tsx"
export interface TSection {
    id: number;
    title: string;
    description: string;
    questions: Array<{
        id: number
        content: string
        subtext?: string
        hasPrecision: boolean
        inputType: {
            id: number
            type: 'radio' | 'text'
        }
        options: {
            id: number
            name: string
            choices: Array<{
                id: number
                name: string
            }>
        }
    }>;
}

export interface TRecommendationType {
    lastname: string;
    firstname: string;
    gender: string;
    fee: string;
    addresses: Array<{
        street: string;
        postcode: string;
        city: string;
        phone: string;
        isAccessible: boolean;
    }>;
}
```

### Faire une requête à l'API 
J’avais expliqué un peu plus tôt dans ce dossier comment effectuer des requêtes à mon API distante avec Axios, mais je n’ai pas précisé comment je spécifie le type de réponse attendue en utilisant les types. 

Dans l’extrait de code précédent, je demande à ma fonction asynchrone `getStaticProps` de me retourner dans mon objet `props` un objet qui attends les données du formulaire de recommandation: `sections`. 

Avant d’utiliser cette donnée dans mes composants Next.js, je vérifie le typage de ma donnée en indiquant que l’objet `props` retourné par `getStaticProps` sera de type `PropsType`. Ensuite, TypeScript va vérifier que les données reçues dans `sections` ont le bon format et correspondent au type attendu qui est `TSection`.  

## La construction du formulaire 
À ce stade du développement, l'attention se tourne vers la création des champs de formulaire, dont les composants dynamiques dépendent des données du back-end.

### Les champs du formulaire
J'ai structuré un dossier `Form` avec un sous-dossier `Input` pour organiser les fichiers des composants du formulaire, incluant divers types de champs comme les cases à cocher, les champs de texte, et les boutons radio. Bien que la plupart seront générés dynamiquement, certains serviront à recueillir les informations sur le soignant recommandé sans génération dynamique.

```jsx title="Components/Form/Input/RadioInputSectionGroup.tsx"
// MUI
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import { Divider } from '@mui/material';
import { Stack } from '@mui/system';

// React
import { useEffect, useState } from 'react';

// Styles
import styles from '../../../styles/Form.module.scss';

// Types
type TChoice = {
  name: string,
  value: string | boolean,
  id: number,
}
type PropsType = {
  label: string,
  question: number,
  choices: TChoice[],
  value: any,
  setValue: any,
  subtext?: string | undefined,
}

export default function RadioInputSectionGroup({ label, question, choices, value, setValue, subtext }: PropsType) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setValue({
      question: `/api/survey/questions/${question}`,
      choice: inputValue,
    });
  }, [setValue, question, inputValue]);

  const generateRadioOptions = () => {
    return choices.map((singleOption) => (
      <FormControlLabel
        checked={inputValue === singleOption.value}
        key={singleOption.id}
        value={singleOption.value}
        label={singleOption.name}
        control={<Radio/>}
      />
    ));
  };

  return (
    <Stack>
      <FormControl className={styles.fieldset} component="fieldset">
        <Stack mb={1}>
          <FormLabel required className={styles.formlabel}>{label}</FormLabel>
          { subtext && <FormLabel className={styles.formlegend}>{subtext}</FormLabel> }
        </Stack>
        <RadioGroup
          className={styles.input}
          onChange={(event) => { setInputValue(event.target.value); }}>
          {generateRadioOptions()}
        </RadioGroup>
      </FormControl>
      <Divider sx={{ marginTop: 3, marginBottom: 3 }}></Divider>
    </Stack>
  );
}
```

Cet extrait décrit la création d'un composant React dynamique avec Material-UI pour un groupe de boutons radio, utilisant `PropsType` pour valider le format des données. Il utilise diverses propriétés: `label` pour l'étiquetage, `question` pour l'URL d'une requête API, `choices` pour les options disponibles, `value` et `setValue` pour gérer la sélection, et `subtext` pour des informations supplémentaires. `inputValue` et `useState` gèrent la sélection actuelle, avec `useEffect` pour la mise à jour. La fonction `generateRadioOptions` crée les boutons via `map()`, retournant des `FormControlLabel` avec un `Radio` et un `label`. Le rendu utilise `FormControl` et `RadioGroup` pour afficher les options.

### Les sections du formulaire
Après avoir créé les composants React nécessaires pour divers champs de formulaire, j'ai développé le composant `Section Form`, destiné à afficher dynamiquement une section du formulaire de recommandation.

```jsx title="Components/Form/Section/SectionForm.tsx"
// Components
import { FormWrapper } from '../FormWrapper';
import { RadioInputSectionGroup } from './../Input';

// React
import { Dispatch, SetStateAction } from 'react';

// Types
import { TAnswerInput, TQuestion, TRecommendationInput, TSection } from '../../../types';

type PropTypes = {
  content: TSection;
  recommendationFormData: TRecommendationInput,
  setRecommendationFormData: Dispatch<SetStateAction<TRecommendationInput>>
}

// Helpers
// A function to help get the Section attended Answers
const getSectionSavedAnswers = (recommendationFormData: TRecommendationInput, questions: TQuestion[]) => {
  return recommendationFormData && recommendationFormData.answers
    ? recommendationFormData.answers.filter((answer) => {
      return questions.map((question) => `/api/survey/questions/${question.id}`).includes(answer.question || '');
    })
    : [];
};
// A function to help get the Question saved Value
const getQuestionSavedAnswers = (question: number, sectionAnswers: TAnswerInput[]) => {
  const savedAnswer = sectionAnswers.find((answer) => {
    return answer.question === `/api/survey/questions/${question}`;
  });
  return savedAnswer ? savedAnswer.choice : '';
};
// A function to help know if the answer is already saved
const isAnswerExists = (savedAnswers: TAnswerInput[], newAnswer: TAnswerInput) => {
  return savedAnswers.some((answer) => answer.question === newAnswer.question);
};

export default function SectionForm({ content, recommendationFormData, setRecommendationFormData } : PropTypes) {
  // Get the Sections already Saved Answers
  const sectionAnswers = getSectionSavedAnswers(recommendationFormData, content.questions);

  // Set the Section Saved Answers
  const setSectionSavedAnswers = (newAnswer: TAnswerInput) => {
    let { answers } = recommendationFormData;
    answers = answers && Array.isArray(answers) ? answers : [];

    // Check if the answer doesn’t exist in saved ones
    if (!isAnswerExists(answers, newAnswer)) {
      answers.push(newAnswer);
      setRecommendationFormData(recommendationFormData);
    } else {
      // Else, replace the existing answer
      answers = answers.map((oldAnswer) => {
        if (oldAnswer.question === newAnswer.question) {
          oldAnswer.choice = newAnswer.choice;
        }
        return oldAnswer;
      });
    }
    recommendationFormData.answers = answers;
    setRecommendationFormData(recommendationFormData);
  };

  return (
    <FormWrapper title={content.title} description={content.description}>
      {content.questions.map((question) => {
        if (question.inputType.type === 'radio') {
          return <RadioInputSectionGroup
            key={question.id}
            label={question.content}
            question={question.id}
            value={getQuestionSavedAnswers(question.id, sectionAnswers)}
            setValue={setSectionSavedAnswers}
            choices={question.options.choices.map((choice) => {
              return {
                id: choice.id,
                name: choice.name,
                value: `/api/survey/choices/${choice.id}`
              };
            })}
            subtext={question.subtext}
          />;
        }
      })}
    </FormWrapper>
  );
}
```

L'extrait de code mentionné introduit l'importation de deux composants, `RadioInputSectionGroup` pour les groupes de boutons radio et `FormWrapper`, une fonction facilitant l'application uniforme de styles à toutes les sections du formulaire, tout en permettant la génération dynamique de titres et descriptions.

Dans cet extrait, des types sont importés pour valider les données échangées avec une API. Plusieurs fonctions sont définies pour gérer les réponses du formulaire de recommandation : `getSectionSavedAnswers` récupère les réponses d'une section pour permettre la navigation sans perte de données, `getQuestionSavedAnswers` obtient la réponse à une question spécifique, et `isAnswerExists` vérifie l'existence préalable d'une réponse.

Le composant `SectionForm` reçoit plusieurs propriétés, dont content pour les données de la section actuelle, `recommendationFormData` pour les réponses enregistrées, et `setRecommendationFormData` pour modifier ces données. À l'aide de map(), il itère sur les questions d'une section, utilisant `RadioInputSectionGroup` pour afficher chaque question avec ses réponses et la sélection actuelle. La sélection d'une réponse déclenche `setSectionSavedAnswers` pour l'ajouter ou la mettre à jour dans les données enregistrées, tandis que `setRecommendationData` actualise les données du formulaire.

### Fusionner les sections du formulaire
En conclusion, l'étape finale consiste à créer la page de l'application Gyn&Co, qui offre aux visiteurs la possibilité de recommander un soignant ou une soignante.

```jsx title="pages/recommendation/index.tsx"
// Axios
import axios from 'axios';

// Components
import { useMultiStepForm } from './../../Components/Form/useMultiStepForm';
import { DoctorForm, SectionForm } from './../../Components/Form/Section';

// Next
import type { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

// React
import { useState, useEffect } from 'react';

// Styles
import styles from '../../styles/Form.module.scss';

// Types
import { TSection, TMedicalSpecialty, TRecommendationInput, TFee, TDoctorInput, TAnswerInput, TValidationFormErrors } from '../../types';
import { Alert, AlertTitle, Container, Divider, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { InputTextField } from '../../Components/Form/Input';

type PropsType = {
  sections: TSection[],
  specialties: TMedicalSpecialty[],
  fees: TFee[],
  name: string | null
}

const Recommendation: NextPage<PropsType> = ({ sections, specialties, fees }) => {
  // Get router prop
  const router = useRouter();
  const apiEndpoint = process.env.NEXT_PUBLIC_ENDPOINT_API || '';

  // UseState
  const [recommendationFormData, setRecommendationFormData] = useState<TRecommendationInput>({});
  const [doctorName, setDoctorName] = useState(router.query.name);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [validationErrors] = useState<TValidationFormErrors>({});

  // Display the recommandation doctor’s name
  useEffect(() => {
    const lastname = recommendationFormData.doctor?.lastname || '';
    const firstname = recommendationFormData.doctor?.firstname || '';

    if (lastname !== '' && firstname !== '') {
      setDoctorName(`${firstname} ${lastname}`);
    }
  }, [recommendationFormData.doctor?.lastname, recommendationFormData.doctor?.firstname]);

  // Set Recommendation Data
  const setRecommendationFormDataValue = (property: keyof TRecommendationInput, value: string & TDoctorInput & TAnswerInput[]) => {
    // Get Doctor Data
    const data: TRecommendationInput = recommendationFormData || {};
    
    // Add the new Data
    data[property] = value;
    setRecommendationFormData(data);
  };

  // Handle Submit
  const handleSubmit = () => {
    // Post the Form
    axios.post(`${apiEndpoint}recommendations`,
      recommendationFormData
    ).then(() => {
      setSubmitSuccess(true);
    }).catch(() => {
      setSubmitError(true);
    });
  };

  // Build the sections components
  const sectionsCpt = sections.map((section) => {
    return (
      <SectionForm
        key={section.id}
        content={section}
        recommendationFormData={recommendationFormData}
        setRecommendationFormData={setRecommendationFormData}
      />
    );
  });

  // Add the static section
  sectionsCpt.unshift(
    <DoctorForm
      specialtiesOptions={specialties}
      feesOptions={fees}
      recommendationFormData={recommendationFormData}
      setRecommendationFormData={setRecommendationFormData}
      validationErrors={validationErrors}
    />
  );

  // Use the multi-step form
  const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next } = useMultiStepForm(validationErrors, sectionsCpt);
  return (
    <Container maxWidth="md" sx={{ marginTop: 10 }}>
      <Stack mb={5} spacing={2} alignItems="center">
        <Typography variant='h4' sx={{ textAlign: 'center' }}>Vous souhaitez recommander {
          doctorName
            ? <Typography variant='h4' component='span' color='secondary'>{doctorName}</Typography>
            : 'un·e soignant·e' 
        } ?</Typography>
        <Typography variant='body1' sx={{ textAlign: 'center' }}>Si tu as été amené·e à consulter pour des questions gynécologiques et que tu aimerais recommander ton/ ou ta soignant·e, voici le questionnaire à remplir&nbsp;! Ce questionnaire est <strong>anonyme</strong>, il ne sera pas diffusé et l’adresse email de contact demandée est facultative. <strong>À titre indicatif, remplir le questionnaire prend environ 4-5 minutes.</strong></Typography>
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          <strong>Attention&nbsp;:</strong> Nous n’ajouterons que des soignant·e·s exerçant dans le champ de la gynéco-obstétrique (médecins généraliste, sage-femme, gynécologue médical, gynécologue-obstétricien·ne, ou encore échographe et infirmi·er·ère si leur expertise se rapproche de ce champ).
        </Typography>
      </Stack>
      {
        submitSuccess && <Alert severity="success">
          <AlertTitle>Merci pour votre recommandation&nbsp;!</AlertTitle>
          Votre recommandation a bien été enregistrée, celle-ci sera traitée au plus vite. <strong>Si vous nous avez laissé une adresse email, nous ne manquerons pas de vous recontacter pour vous avertir de sa publication.</strong>
        </Alert>
      }
      {
        submitError && <Alert severity="error">
          <AlertTitle>Une erreur inconnue est survenue ☹️</AlertTitle>
          Merci de réessayer plus tard ou de nous contacter si celle-ci persiste.
        </Alert>
      }
      {
        !submitSuccess && !submitError && 
        <div className={styles.form}>
          <Stack className={styles.fieldset} spacing={3}>
            <InputTextField
              label='Votre email'
              field='email'
              required={false}
              error={validationErrors.email === true}
              value={recommendationFormData && recommendationFormData.email ? recommendationFormData.email : ''}
              setValue={setRecommendationFormDataValue}
              helperText='L’adresse email est facultative. Celle-ci n’est nécessaire que si vous souhaitez être averti·e lors de la publication du ou de la soignante que vous nous aurez recommandé·e.'
            />
          </Stack>
          <Divider sx={{ marginTop: 5, marginBottom: 5 }}></Divider>
          <form>
            <div className={styles.steps}>
              {currentStepIndex + 1} / {steps.length}
            </div>
            {step}
            <div className={styles.buttons}>
              {
                !isFirstStep && <button type='button' onClick={back}>Retour</button>
              }
              {
                isLastStep
                  ? <button type='button' onClick={handleSubmit}>Terminer</button>
                  : <button type='button' onClick={next}>Suivant</button>
              }
            </div>
          </form>
        </div>
      }
    </Container>
  );
};

// Fetch Data from API Call
export const getStaticProps: GetStaticProps = async () => {
  const sections = await axios.get(process.env.NEXT_PUBLIC_ENDPOINT_API + 'survey/sections', {
    headers: {
      'accept': 'application/json'
    },
  });

  // Fetch Specialties
  const specialties = await axios.get(process.env.NEXT_PUBLIC_ENDPOINT_API + 'specialties', {
    headers: {
      'accept': 'application/json'
    },
  });

  // Fetch Fees
  const fees = await axios.get(process.env.NEXT_PUBLIC_ENDPOINT_API + 'fees', {
    headers: {
      'accept': 'application/json'
    },
  });

  return {
    props: {
      sections: sections.data,
      specialties: specialties.data,
      fees: fees.data,
    }
  };
};

export default Recommendation;
```

## Avantages et bénéfices 
La mise en place d’un formulaire à plusieurs étapes permet de réduire la charge cognitive de l’utilisateur et l’utilisatrice, car la surcharge de questions à répondre est découpée en plusieurs étapes. Nous avons également pensé à rétrécir et regrouper la quantité de questions qui sont posées dans le formulaire pendant la phase de conception.  
De plus, l’utilisateur et l’utilisatrice peuvent connaître leur progression dans le formulaire à l’aide d’une pagination, conserver les données renseignées sur chaque étape et naviguer entre les différentes étapes jusqu’à la soumission du formulaire.
Nous avons également préféré personnaliser le formulaire en commençant par renseigner les informations du soignant et de la soignante avant de demander des détails personnels. 