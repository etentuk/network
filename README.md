# Network

## Description

This project was completed as a requirement for the Harvard Course **CS50's Web Programming with Python and JavaScript** as such it is a Django HTML Website.

This is a single page **Twitter** like website which allows you to post, follow, like and unlike users and their posts.

## How to Run

This project can be run using either docker containers or with your computer.

### On Computer

You can find the installation guide in [Installing Django](https://docs.djangoproject.com/en/3.2/topics/install/).

Once installed navigate to the root directory of the project in your terminal and run the following commands

1.  `python3 manage.py makemigrations`
2.  `python3 manage.py migrate`
3.  `python3 manage.py runserver`

### Using Docker

You can find the guide to downloading Docker in [Installing Docker](https://docs.docker.com/get-docker/).

Once installed, run `docker compose up` to start the containers.

Within a new terminal run the following commands.

1. `docker ps` which will give you a container ID
2. `docker exec -it` _container_id_ `bash -l`
3. `python3 manage.py makemigrations`
4. `python3 manage.py migrate`
5. `python3 manage.py runserver`

## Specifications

-   Create New Post
-   View All Posts
-   View Profile Page
-   View Following Page
-   Pagination of Posts
-   Edit Post
-   Like and Unlike Posts

## Live Demo

CS50 [Network](https://youtu.be/lLRXpPPsvmk)
