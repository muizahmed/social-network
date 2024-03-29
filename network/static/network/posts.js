﻿document.addEventListener('DOMContentLoaded', function () {

    // Maintain Browser History
    window.addEventListener('popstate', function (event) {
        if (event.state === null) {
            document.querySelector('.posts-view').style.display = 'flex';
            document.querySelector('.editor-container').style.display = 'none';
        }
        else if (event.state.view === 'editor') {
            document.querySelector('.posts-view').style.display = 'none';
            document.querySelector('.editor-container').style.display = 'block';
        }
    })

    // Render Like and Follow Buttons upon load
    if (window.location.pathname != '/') {
        renderLikeIcons();
    }

    if (window.location.pathname.includes('profile/')) {
        renderFollowButton();
    }

    // Add click event listeners to buttons
    document.querySelectorAll('.edit-post').forEach(element => {
        element.addEventListener('click', function () {
            let postId = findParent(this, 'container-div').dataset.postid;
            editPost(postId);
        })
    })

    document.querySelectorAll('.like-button').forEach(element => {
        element.addEventListener('click', function () {
            let postId = findParent(this, 'container-div').dataset.postid;
            like(postId);
        })
    })

    document.querySelectorAll('.follow-button').forEach(element => {
        element.addEventListener('click', function () {
            let userId = findParent(this, 'container-div').dataset.userid;
            follow(userId);
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
            document.querySelector(`[data-postid="${postId}"] .post-modified`).innerHTML = ' · Edited';
            // Go back to Posts view
            document.querySelector('.posts-view').style.display = 'flex';
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

function animateLikes(postId) {
    let likeElement = document.querySelector(`[data-postid="${postId}"] .post-likes`);
    let dataset = likeElement.dataset;
    let likeButton = likeElement.querySelector('.like-button')
    let likeCount = likeElement.querySelector('.like-count');
    let likes = parseInt(likeCount.innerHTML);

    // Add animation and change like count
    if (dataset.liked === "True") {
        dataset.liked = 'False';
        likes -= 1;
        likeCount.innerHTML = likes;
    }
    else {
        likeButton.style.animation = 'jump-up 0.5s';
        dataset.liked = 'True';
        likes += 1;
        likeCount.innerHTML = likes;
    }
    likeCount.style.animation = 'fade 0.5s';
    setTimeout(renderLikeIcons, 100);
    likeElement.addEventListener('animationend', function () {
        likeButton.style.animation = '';
        likeCount.style.animation = '';
    });
}

function like(postId) {
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
                animateLikes(postId);
            }
        })
}

function renderLikeIcons() {
    let likes = document.querySelectorAll('.post-likes');
    likes.forEach(like => {
        let likeIcon = like.querySelector('.like-button');
        if (like.dataset.liked === "True") {
            likeIcon.innerHTML = '<i class="fa-solid fa-thumbs-up"></i>';
        }
        else {
            likeIcon.innerHTML = '<i class="fa-regular fa-thumbs-up"></i>';
        }
    })
}

function renderFollowButton() {
    let followButton = document.querySelector('.follow-button');
    if (document.querySelector('.user-info').dataset.followed === "True") {
        followButton.classList.add('disabled');
        followButton.innerHTML = 'Following';
    } else {
        followButton.classList.remove('disabled');
        followButton.innerHTML = 'Follow';
    }
}

function follow(userId) {
    fetch(`${window.location.origin}/profile/follow/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
            "userId": userId
        })
    })
        .then(response => {
            if (response.ok) {
                let dataset = document.querySelector('.user-info').dataset;
                let followers = document.querySelector('.follower-count');
                let followerCount = parseInt(followers.innerHTML);
                console.log(followers);
                if (dataset.followed === "True") {
                    followerCount -= 1;
                    dataset.followed = 'False';
                }
                else {
                    followerCount += 1;
                    dataset.followed = 'True'
                }
                followers.innerHTML = followerCount;
                renderFollowButton();
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
