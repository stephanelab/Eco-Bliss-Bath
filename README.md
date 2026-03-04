<div align="center">

# Eco-Bliss-Bath
</div>

<p align="center">
    <img src="https://img.shields.io/badge/MariaDB-v11.7.2-blue">
    <img src="https://img.shields.io/badge/Symfony-v6.2-blue">
    <img src="https://img.shields.io/badge/Angular-v13.3.0-blue">
    <img src="https://img.shields.io/badge/docker--build-passing-brightgreen">
    <img src="https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/detailed/a7cucx&style=flat&logo=cypress">
    
  <br><br><br>
</p>

# Prérequis
Pour démarrer cet applicatif web vous devez avoir les outils suivants:
- Docker
- NodeJs

# Installation et démarrage
Clonez le projet pour le récupérer
``` 
git clone https://github.com/stephanelab/Eco-Bliss-Bath.git
```
Pour démarrer l'API avec sa base de données.
```
docker compose up -d
```
# Pour démarrer le frontend de l'applicatif
Rendez-vous dans le dossier frontend
```
cd ./frontend
```
Installez les dépendances du projet
```
npm i
ou
npm install (si vous préférez)
```
Démarrer le frontend
```
npm start
```
Cliquer sur le lien dans le terminal
[http://localhost:4200/](http://localhost:4200/)

# Pour démarrer les tests
Rendez-vous dans le dossier frontend
```
cd ./frontend
```
Installez les dépendances du projet
```
npm install cypress --save-dev
```
Lancer Cypress
* dans le terminal
```
npx cypress run
```
ou
* dans l'application
```
npx cypress open
```
puis choisir "**E2E Testing**"

# Pour générer des rapports de tests
Lien pour générer des rapports de tests : [Cypress cloud](https://cloud.cypress.io/projects/a7cucx/)