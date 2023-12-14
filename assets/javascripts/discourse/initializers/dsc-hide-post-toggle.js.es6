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
        //Loading
        api.decorateWidget('post:after', helper => {
            const postInTopicId = helper.attrs.topicId;
            const str_postInTopicId = postInTopicId.toString();
            const site_Settings = api.container.lookup('site-settings:main');
            const ghostmode_topics = site_Settings.ghostmode_topics;
            const isTopicHidden = ghostmode_topics.includes(str_postInTopicId);
            const toggleTopicElement = document.querySelector("#topic-footer-button-toggleHidePost");

            if (isTopicHidden) {
                toggleTopicElement.style.backgroundColor = 'red';
            } else {
                toggleTopicElement.style.backgroundColor = 'yellow';
            }
         });
        //
        // Working of Hiding and showing of posts.
        api.attachWidgetAction('post-menu', 'toggleHidePost', function () {
            const model = this.attrs;
            const postId = model.id;
            //const topicId = model.topicId;
            const siteSettings = api.container.lookup('site-settings:main');
            const ghostmode_posts = siteSettings.ghostmode_posts;
            const isPostHidden = ghostmode_posts.includes(postId);
            const newGhostModePosts = postId;
            const msg = model.cooked;
            let trimmedMsg = msg.substring(3, msg.length - 4);
            let first25trimmedMsg = trimmedMsg.substring(0, 25);

            if (isPostHidden) {
                removeSetting(api, postId);
                alert(`Username : ${model.username}\nPost Id : ${newGhostModePosts} Removed\nPost : ${first25trimmedMsg}`);
                location.reload();
            } else {
                addSetting(api, postId);
                // eslint-disable-next-line no-alert
                alert(`Username : ${model.username}\nPost Id : ${newGhostModePosts} Added\nPost : ${first25trimmedMsg}`);
                location.reload();
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
                className: isPostHidden ? 'button.topic_hidden custom-class-hidden' : 'button.topic_visible custom-class-visible',
                icon: isPostHidden ? 'far-eye-slash' : 'far-eye',
                title: isPostHidden ? 'Hide Post' : 'Show Post',
            };
        });
        // e - Button to Hide Post

        // s - Button to Hide Topic
        api.registerTopicFooterButton({
            id: "toggleHidePost",
            icon: "far-eye",
            title: "Show/Hide Topic",
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
        // eslint-disable-next-line no-console
        console.log(response);
    }).catch(error => {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log(response);
    }).catch(error => {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log(response);
    }).catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
    });
}

            //const dataPostId = document.querySelector(`[data-post-id="${postId}"]`);
            //const dataPostIdParent = dataPostId.parentElement;
            //const showHideButton = document.querySelector(`[data-post-id="${postId}"] [title="[en.button_title.show_post]"]`) || document.querySelector(`[data-post-id="${postId}"] [title="[en.button_title.hide_post]"]`) ;
            //dataPostIdParent.style.backgroundColor = 'yellow';
            //dataPostId.style.backgroundColor = 'initial';
            //showHideButton.style.backgroundColor = 'yellow';