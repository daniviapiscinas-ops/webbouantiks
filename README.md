# Bou Antiks + Firebase

Archivos incluidos:

- `index.html` — página principal.
- `coleccion.html` — página dinámica para cada colección.
- `admin.html` — panel admin con Firebase Authentication.
- `styles.css` — estilos.
- `app.js` — carga datos públicos desde Firestore.
- `admin.js` — login, edición y subida de imágenes.
- `firebase-config.js` — aquí van tus claves de Firebase.

## Configuración rápida

1. Crea un proyecto en Firebase.
2. Activa:
   - Authentication > Email/Password.
   - Firestore Database.
   - Storage.
3. Crea tu usuario admin en Authentication.
4. Copia la configuración SDK en `firebase-config.js`.
5. Sube todo a GitHub.

## Estructura Firestore usada

`settings/site`
```js
{
  brand,
  subtitle,
  headline,
  heroSubtitle,
  tagline,
  email,
  phone,
  whatsapp,
  address,
  hours,
  logo
}
```

`collections/{id}`
```js
{
  title,
  description,
  emoji,
  cover,
  order
}
```

`gallery/{autoId}`
```js
{
  collectionId,
  title,
  description,
  image,
  order
}
```

## Reglas básicas recomendadas

Firestore:
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /collections/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /gallery/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Storage:
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
