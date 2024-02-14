# Twitter-like Social Network Django App

This repository contains the implementation of a Twitter-like social network Django app, where users can make posts, follow other users, and "like" posts. The project fulfills the requirements outlined in the [CS50 Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/2020/projects/4/network/) course.

## Demo

Watch a demo of the project on [YouTube](https://youtu.be/2r5dcN7a0dU).

## Features

- **New Post**: Users can create new text-based posts by filling in a text area and submitting the post.
- **All Posts**: Users can view all posts from all users, with the most recent posts displayed first.
- **Profile Page**: Clicking on a username displays that user's profile page, showing their followers, the people they follow, and their posts.
- **Following**: Users can view posts made by users they follow.
- **Pagination**: Posts are displayed 10 per page with pagination navigation.
- **Edit Post**: Users can edit their own posts using a textarea without reloading the entire page.
- **Like and Unlike**: Users can like or unlike posts asynchronously without reloading the entire page.

## Usage

To use the application, follow these steps:

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Install the necessary dependencies. It's recommended to use a virtual environment:

    ```bash
    cd twitter-like-social-network
    pip install -r requirements.txt
    ```

3. Run migrations to set up the database:

    ```bash
    python manage.py migrate
    ```

4. Start the Django development server:

    ```bash
    python manage.py runserver
    ```

5. Access the application in your web browser at `http://127.0.0.1:8000/`.

## Technologies Used

- Python
- Django
- HTML
- CSS
- JavaScript
- Bootstrap

## Credits

Base template by distribution code from CS50W's Network Project.
