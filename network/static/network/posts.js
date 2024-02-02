document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function () {
        console.log(window.history);
        console.log(window.history.state);
    })

    document.querySelector('.edit-post').addEventListener('click', function () {
        let postId = this.id.split("editPost")[1]
        editPost(postId);
    });

    // Maintain Browser History
    window.addEventListener('popstate', function (event) {
        if (event.state === null) {
            document.querySelector('.posts-view').style.display = 'block';
            document.querySelector('.editor-container').style.display = 'none';
        }
        else if (event.state.view === 'editor') {
            document.querySelector('.posts-view').style.display = 'none';
            document.querySelector('.editor-container').style.display = 'block';
        }
    });
})

function editPost(postId) {
    window.history.pushState({ view: 'editor' }, '');

    // Go to editor view
    document.querySelector('.posts-view').style.display = 'none';
    document.querySelector('.editor-container').style.display = 'block';

    let editor = document.querySelector('.post-editor')

    // Fetch the original post content from the server
    fetch(`/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            editor.value = post.content;
        })

    // Clear existing event listener and attach a new one
    document.querySelector('.save-edits').removeEventListener('click', () => savePost(postId, editor.value));
    document.querySelector('.save-edits').addEventListener('click', () => savePost(postId, editor.value));
}

function savePost(postId, content) {
    // Get CSRFToken
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Send the edited post back to the server
    fetch(`/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            content: content
        }),
    })

        // Go back to all posts page and show updated content
        .then(response => {
            if (response.ok) {
                // Handle post update success
                document.getElementById(postId).innerHTML = content.replace(/\n/g, '<br>');
                // Go back to Posts view
                document.querySelector('.posts-view').style.display = 'block';
                document.querySelector('.editor-container').style.display = 'none';
            }
        })
        .catch(error => {
            console.log("Content not updated.", error)
        })
}
