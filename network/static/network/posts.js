document.addEventListener('DOMContentLoaded', function () {

    // Maintain Browser History
    window.addEventListener('popstate', function (event) {
        if (event.state === null) {
            document.querySelector('.posts-view').style.display = 'block';
            document.querySelector('.editor-container').style.display = 'none';
        }
        if (event.state.view === 'editor') {
            document.querySelector('.posts-view').style.display = 'none';
            document.querySelector('.editor-container').style.display = 'block';
        }
    })

    // Render Likes
    if (window.location.pathname != '/') {
        renderLikes();
    }

    // Add click event listeners to buttons
    document.querySelectorAll('.edit-post').forEach(element => {
        element.addEventListener('click', function () {
            document.querySelector('.post-container')
            let postId = findParent(this, 'post-container').dataset.postid;
            editPost(postId);
        })
    })

    document.querySelectorAll('.like-button').forEach(element => {
        element.addEventListener('click', function () {
            let postId = findParent(this, 'post-container').dataset.postid;
            let icon = findParent(this, 'post-container').querySelector('.like-button')
            likeButton(postId, icon);
        })
    })
})

function editPost(postId) {
    window.history.pushState({ view: 'editor' }, '');

    // Go to editor view
    document.querySelector('.posts-view').style.display = 'none';
    document.querySelector('.editor-container').style.display = 'block';

    let editor = document.querySelector('.post-editor')

    // Fetch the original post content from the server
    fetch(`posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            editor.value = post.content;
        })

    // Clear existing event listener and attach a new one
    document.querySelector('.save-edits').removeEventListener('click', () => savePost(postId, editor.value));
    document.querySelector('.save-edits').addEventListener('click', () => savePost(postId, editor.value));
}

function savePost(postId, content) {

    // Send the edited post back to the server
    fetch(`posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: content
        }),
    })

        // Go back to all posts page and show updated content
        .then(() => {
            // Handle post update success
            document.querySelector(`[data-postid="${postId}"] .post-content`).innerHTML = content.replace(/\n/g, '<br>');
            // Go back to Posts view
            document.querySelector('.posts-view').style.display = 'block';
            document.querySelector('.editor-container').style.display = 'none';
        })
        .catch(error => {
            console.log("Content not updated.", error)
        })
}

function pagePosts() {
    let posts = document.querySelectorAll('[data-postid]');
    let postIdArray = [];

    for (let post of posts) {
        postIdArray.push(post.getAttribute('data-postid'));
    }

    return postIdArray;
}

function renderLikes() {
    pagePosts().forEach(postId => {
        fetch(`${window.location.origin}/posts/like/${postId}`)
            .then(response => response.json())
            .then(likes => {
                // Render Likes Count
                let likeElement = document.querySelector(`[data-postid="${postId}"] .post-likes`);
                let likeCount = likeElement.querySelector('.like-count');
                likeCount.innerHTML = ` ${likes.like_count}`;

                // Render Like Button styling
                let likeIcon = likeElement.querySelector('.like-button');
                if (likes.user_liked) {
                    likeIcon.classList.add('liked');
                    likeIcon.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
                }
                else {
                    likeIcon.classList.remove('liked');
                    likeIcon.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';
                }
            });
    });
}

function animateLikeCount(postId) {
    let likeElement = document.querySelector(`[data-postid="${postId}"] .post-likes`);
    let likeButton = likeElement.querySelector('.like-button')
    let likeCount = likeElement.querySelector('.like-count');
    likeCount.style.animation = 'fade 0.5s';
    if (!likeButton.classList.contains('liked')) {
        likeButton.style.animation = 'jump-up 0.5s';
    }
    setTimeout(renderLikes, 100);
    likeElement.addEventListener('animationend', function () {
        likeButton.style.animation = '';
        likeCount.style.animation = '';
    });
}

function likeButton(postId) {
    fetch(`${window.location.origin}/posts/like/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "postId": postId
        })
    })
        .then(response => {
            if (response.ok) {
                animateLikeCount(postId);
            }
        })
}


// Helper Functions
function findParent(childElement, parentClass) {
    // Look for a parent with a specific class
    parent = childElement.parentElement;
    while (parent != null && !parent.classList.contains(parentClass)) {
        childElement = parent;
        parent = childElement.parentElement;
    }
    return parent;
}
