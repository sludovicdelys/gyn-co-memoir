---
sidebar_position: 11
---

# Sécurité 

Dans un précédent chapitre, nous avons décrit plusieurs outils et bonnes pratiques de sécurité que nous avons mise en place pour assurer un système d’authentification sécurisée.

Voici une liste simplifiée des protections implémentées en lien avec le Top 10 OWASP :
- 🏴‍☠️ **A02:2021-Cryptographic failures**
    - Utilisation de mots de passe sécurisés et hachage
- 🏴‍☠️ **A08:2021-Software and Data Integrity Failures**
    - Protection contre les attaques CSRF
- 🏴‍☠️ **A07:2021-Identification and Authentication Failures**  
    - Utilisation d’une authentification personnalisé
- 🏴‍☠️ **A05:2021-Security Misconfiguration**
    - Configuration des pare-feux
- 🏴‍☠️ **A01:2021-Broken Access Control**
    - Configuration des contrôles d’accès
- 🏴‍☠️ **A07:2021-Identification and Authentication Failures**
    - Configuration des différents rôles utilisateurs

[Les changements du Top 10 pour 2021](/img/owasp.png)

Cependant j’aimerais apporter plus de détails à certaines failles de sécurité que nous avons détectées et des outils que nous avons mis en place pour y remédier.

## Injection SQL

Depuis plusieurs années, l’injection de code a été classée parmi les trois premières vulnérabilités dans le Top 10 d’OWASP. L’injection SQL fait référence aux attaques contre les bases de données relationnelles y compris notre base de données MySQL. Elle se produit lorsqu’une application web n’arrive pas à filtrer correctement les données d’entrée de l’utilisateur, ce qui permet à une attaquante de modifier la requête SQL envoyée par l’application web à la base de données. Une attaquante peut récupérer des informations sensibles ou contourner une page d’authentification, ce qui peut avoir un impact énorme sur la sécurité de l’application.

Ce sera vers notre application back-end construite avec Symfony, l’ORM (Object-Relational Mapping) de Doctrine et EasyAdmin que les injections SQL peuvent être envoyées. L’avantage du framework Symfony est qu’il inclut une couche de sécurité dans l’utilisation de Doctrine ORM qui va utiliser des requêtes paramétrées pour empêcher les injections SQL. Lorsqu’on utilise la classe QueryBuilder de Doctrine, les valeurs des paramètres de requêtes sont automatiquement échappées et insérées de manière sécurisée dans la requête préparée. Cela aide à prévenir les injections SQL en s’assurant que les données fournies par l’attaquante ne sont pas directement concaténées dans la requête SQL, mais plutôt traitées comme des paramètres.

📚 Ressources : 
- [Documentation OWASP : SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Injections SQL (SQLi) - principes, impacts, exploitations et bonnes pratiques de sécurité](https://www.vaadata.com/blog/fr/injections-sql-principes-impacts-exploitations-bonnes-pratiques-securite/)
- [Blog: La sécurité sur Symfony](https://www.vaadata.com/blog/fr/la-securite-sur-symfony-episode-1-injection-xss-auth/)

## Failles XSS

Les XSS (Cross-site Scripting) font partie de la catégorie des vulnérabilités par injection de code au même titre que les injections SQL. Elles se produisent lorsque des scripts malveillants sont injectés et exécutés via les paramètres d’entrée côté client.

```tsx title="/Components/Input/TextFieldInput.tsx"
export default function TextFieldInput({
  setError,
  clearError,
  error,
  field,
  inputValue,
  label,
  pattern,
  required,
  rows,
  setFormData,
  setValue,
  size,
}: TProps) {
  // A function to update the global form data
  const updateFormData = (value: string) => {
    // ...Update the Form data
    setFormData((data: TDoctorInput | TAddressObject) => ({
      ...data,
      ...{ [field]: value },
    }));
  };

  // A function to update the input errors
  const updateErrors = (value: string, display: boolean) => {
    if (required && value.length < 2) {
      setError(
        field,
        display,
        'required',
        `Le champ « ${label} » requis. Longueur minimale : 2.`
      );
      return;
    }
    if (pattern && pattern.test(value)) {
      setError(
        field,
        display,
        'format',
        'Ce format de chaîne de caractères n’est pas autorisé.'
      );
      return;
    }
    clearError(field);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // ...Update the State
    setValue(event.target.value);

    // ...Update Errors
    updateErrors(value, true);

    if (!error) {
      // ...Update the global form data
      updateFormData(value);
    }
  };

  // On the first render...
  useEffect(() => {
    // ...Update errors
    updateErrors(inputValue, false);

    // ... Disable the warning for dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TextField
      required={required}
      error={error !== undefined && error.displayed}
      size={size}
      multiline
      rows={rows || 1}
      fullWidth
      label={label}
      value={inputValue}
      variant="outlined"
      helperText={error?.displayed ? error?.message : ''}
      onChange={handleChange}
    />
  );
}
```

Dans l’extrait de code ci-dessus du front-end de notre application, nous avons pris certaines pour prévenir contre les attaques XSS :

- Sanitisation : la saisie de l’utilisateur `inputValue` est assignée à la prop value du composant `<TextField/>`, sans l’interpréter en tant que HTML. Ainsi, toute tentative d’injection de code HTML malveillant serait traitée comme une simple chaîne de caractères.

- Gestion des erreurs : la logique de gestion des erreurs pour afficher des message d’erreur en fonction des résultats de validation sont prédéfinies et controlées dans le code. Cela contribue à éviter l’injection des scripts malveillants via les messages d’erreur.

- Validation : le code inclut une logique de validation pour vérifier la longueur et le format de la valeur saisie. Cela réduit le risque d’accepter une saisie potentiellement malveillante.

Dans une future évolution de l’application, je pense qu’il serait sage d’utiliser un middleware de sécurité. Je pense notamment à **helmet** le middleware de sécurité offerte par Next.js et qui permet de configurer des entêtes de sécurité HTTP, tels que **X-XSS-Protection**`.

📚 Ressources : 
-  [Documentation OWASP : Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Failles XSS (Cross-site Scripting)](https://www.vaadata.com/blog/fr/failles-xss-principes-types-dattaques-exploitations-et-bonnes-pratiques-securite/)
- [Blog: React MUI Content Security Policy](https://dev.to/navyaarora01/react-mui-content-security-policy-2gp)

## Validation des données 

La validation de formulaire joue un rôle crucial dans la prévention des injections. En appliquant une validation sur les données saisies par nos utilisateurs et utilisatrices, nous réduisons les risques d’injections avant d’être persistées en base de données.
Côté serveur la validation des données est gérée avec les assertions de Symfony. C’est un processus qui s’assure que les données soumises par l’utilisateur et l’utilisatrice respectent les règles de validation définies par l’application.
Elles sont implémentées avec des annotations qui sont appliquées aux propriétés d’un objet ou aux arguments d'une méthode; elles permettent de spécifier des contraintes de validation qui doivent être respectées lors de la soumission.
Dans l’extrait de code ci-dessous venant de l’entité Doctrine `Recommendation` qui gère la recommandation d’un soignant et d’une soignante on utilise l’annotation `#[Assert\Email]` pour s’assurer qu’une adresse email est valide.

```php title="/src/Entity/Recommendation.php"
class Recommendation
{
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['recommendation:write'])]
    #[Assert\Email]
    private ?string $email = null;
}
```

📚 Ressources :
- [Documentation Symfony : Validation](https://symfony.com/doc/current/validation.html)
- [La sécurité sur Symfony](https://www.vaadata.com/blog/fr/la-securite-sur-symfony-episode-1-injection-xss-auth/)
- [Documentation OWASP : Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)