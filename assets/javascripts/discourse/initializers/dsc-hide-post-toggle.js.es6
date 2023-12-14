/* eslint-disable no-alert */
import { h } from 'virtual-dom';
import { ajax } from 'discourse/lib/ajax';
import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
    name: 'dsc-hide-post-toggle',
    initialize() {
        withPluginApi('0.8.7', (api) => {
            const currentUser = api.getCurrentUser();
            if (!currentUser || !currentUser.admin) {
                return;
            }
        //----------------------------------------------------------------
            console.log("At Start of plugin");

        //----------------------------------------------------------------

        // Working of Hiding and showing of posts.
        api.attachWidgetAction('post-menu', 'toggleHidePost', function () {
            const model = this.attrs;
            //console.log('model',model);

            const postId = model.id;
            //const topicId = model.topicId;

            const siteSettings = api.container.lookup('site-settings:main');

            const ghostmode_posts = siteSettings.ghostmode_posts;
            //const ghostmode_topics = siteSettings.ghostmode_topics;

            const isPostHidden = ghostmode_posts.includes(postId);
            console.log('isPostHidden:', typeof (isPostHidden), isPostHidden);

            const newGhostModePosts = postId;

            //const dataPostId = document.querySelector(`[data-post-id="${postId}"]`);
            //const dataPostIdParent = dataPostId.parentElement;
            //const showHideButton = document.querySelector(`[data-post-id="${postId}"] [title="[en.button_title.show_post]"]`) || document.querySelector(`[data-post-id="${postId}"] [title="[en.button_title.hide_post]"]`) ;
            //dataPostIdParent.style.backgroundColor = 'yellow';
            //dataPostId.style.backgroundColor = 'initial';
            //showHideButton.style.backgroundColor = 'yellow';

            const msg = model.cooked;
            let trimmedMsg = msg.substring(3, msg.length - 4);
            let first25trimmedMsg = trimmedMsg.substring(0, 25);

            const isPostHiddenTrue = isPostHidden === true;
            console.log('isPostHiddenTrue', isPostHiddenTrue);


            if (isPostHidden) {
                removeSetting(api, postId);
                alert(`Username : ${model.username}\nPost Id : ${newGhostModePosts} Removed\nPost : ${first25trimmedMsg}`);
                location.reload();

                //history.go(0);
                //api.replaceIcon('far-eye-slash', 'far-eye');

            } else {
                addSetting(api, postId);
                // eslint-disable-next-line no-alert
                alert(`Username : ${model.username}\nPost Id : ${newGhostModePosts} Added\nPost : ${first25trimmedMsg}`);
                location.reload();

                //history.go(0);
                //api.replaceIcon('far-eye', 'far-eye-slash');

            }
        });

        // s - Button to Hide Post
        api.addPostMenuButton('toggleHidePostButton', (model) => {
            const siteSettings = api.container.lookup('site-settings:main');
            const ghostmode_posts = siteSettings.ghostmode_posts;
            const postId = model.id;
            const isPostHidden = ghostmode_posts.includes(postId);
            return {
                action: 'toggleHidePost',
                position: 'first',

                //className: isPostHidden ? 'button.topic_visible custom-class-visible' : 'button.topic_hidden custom-class-hidden',
                //icon: isPostHidden ? 'far-eye' : 'far-eye-slash',
                //title: isPostHidden ? 'Show Post' : 'Hide Post',

                className: isPostHidden ? 'button.topic_hidden custom-class-hidden' : 'button.topic_visible custom-class-visible',
                icon: isPostHidden ? 'far-eye-slash' : 'far-eye',
                title: isPostHidden ? 'button_title.hide_post' : 'button_title.show_post',
            };
        });
        // e - Button to Hide Post

        // s - Button to Hide Topic
        api.registerTopicFooterButton({
            id: "toggleHidePost",
            key: "far-eye",
            icon: "far-eye",
            action() {
                const model = this.attrs;
                const topicId = model.topic.value.id;
                toggleHideTopic(api, topicId);
            }
        });
        // e - Button to Hide Topic

    });
},
};

// Add the postId to the site settings
function addSetting(api, postId) {
    const controller = api.container.lookup('site-settings:main');
    const newGhostmodePosts = `${controller.ghostmode_posts ? controller.ghostmode_posts + '|' : ''}${postId}`;

    return ajax(`/admin/site_settings/ghostmode_posts`, {
        type: 'PUT',
        data: {
            ghostmode_posts: newGhostmodePosts,
        },
    }).then(response => {
        console.log(response);
    }).catch(error => {
        console.error(error);
    });
}

// Remove the postId from the site settings
function removeSetting(api, postIdToRemove) {
    const controller = api.container.lookup('site-settings:main');
    const currentGhostmodePosts = controller.ghostmode_posts || '';
    const currentPostIds = currentGhostmodePosts.split('|');

    // Remove the postId to delete
    const newGhostmodePosts = controller.ghostmode_posts.replace(new RegExp(`\\|${postIdToRemove}`, 'g'), '');

    return ajax(`/admin/site_settings/ghostmode_posts`, {
        type: 'PUT',
        data: {
            ghostmode_posts: newGhostmodePosts,
        },
    }).then(response => {
        console.log('Response', response);
    }).catch(error => {
        console.error(error);
    });
}


function toggleHideTopic(api, topicId) {
    const controller = api.container.lookup('site-settings:main');
    const currentGhostmodeTopics = controller.ghostmode_topics || '';
    //const currentTopicIds = currentGhostmodeTopics.split('|');

    const isTopicHidden = currentGhostmodeTopics.includes(topicId);
    const toggleTopicElement = document.querySelector("#topic-footer-button-toggleHidePost");

    if (isTopicHidden) {
        // Remove topic ID
        const newGhostmodeTopics = controller.ghostmode_topics.replace(new RegExp(`\\|${topicId}`, 'g'), '');
        updateGhostmodeTopics(api, newGhostmodeTopics);
        alert(`Topic ID ${topicId} Removed`);
        toggleTopicElement.style.backgroundColor = 'yellow';
    } else {
        // Add topic ID
        const newGhostmodeTopics = `${currentGhostmodeTopics ? currentGhostmodeTopics + '|' : ''}${topicId}`;
        updateGhostmodeTopics(api, newGhostmodeTopics);
        alert(`Topic ID ${topicId} Added`);
        toggleTopicElement.style.backgroundColor = 'red';
    }
}

function updateGhostmodeTopics(api, newGhostmodeTopics) {
    return ajax(`/admin/site_settings/ghostmode_topics`, {
        type: 'PUT',
        data: {
            ghostmode_topics: newGhostmodeTopics,
        },
    }).then(response => {
        console.log('Response', response);
    }).catch(error => {
        console.error(error);
    });
}
