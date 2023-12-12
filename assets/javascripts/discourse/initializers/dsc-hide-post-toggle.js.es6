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

            api.attachWidgetAction('post-menu', 'toggleHidePost', function () {
                const model = this.attrs;
                const postId = model.id;
                const topicId = model.topicId;

                const dataPostId = document.querySelector(`[data-post-id="${postId}"]`);

                const dataPostIdParent = dataPostId.parentElement;
                const siteSettings = api.container.lookup('site-settings:main');
                const ghostmode_posts = siteSettings.ghostmode_posts;
                const ghostmode_topics = siteSettings.ghostmode_topics;

                const isPostHidden = ghostmode_posts.includes(postId);
                const newGhostModePosts = postId;

                if (isPostHidden) {
                    removeSetting(api, postId);
                    alert(`Id : ${newGhostModePosts} Removed`);
                    dataPostIdParent.style.backgroundColor = 'yellow';
                } else {
                    //const showButtonParentElement = showButtonElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                    addSetting(api, postId);
                    alert(`Id : ${newGhostModePosts} Added`);
                    dataPostIdParent.style.backgroundColor = 'red';
                }
            });

            api.addPostMenuButton('toggleHidePostButton', (model) => {
                const siteSettings = api.container.lookup('site-settings:main');
                const ghostmode_posts = siteSettings.ghostmode_posts;
                const postId = model.id;
                const isPostHidden = ghostmode_posts.includes(postId);
                return {
                    action: 'toggleHidePost',
                    icon: isPostHidden ? 'far-eye-slash' : 'far-eye',
                    title: isPostHidden ? 'button_title.hide_post' : 'button_title.show_post',
                    position: 'first',
                };
            });

            //
            api.registerTopicFooterButton({
                id: "toggleHidePost",
                key: "flag",
                icon: "flag",
                action() {
                    const model = this.attrs;
                    const topicId = model.topic.value.id;
                    toggleHideTopic(api, topicId);
                }
            });
            //

        });
    },
};

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

    if (isTopicHidden) {
        // Remove topic ID
        const newGhostmodeTopics = controller.ghostmode_topics.replace(new RegExp(`\\|${topicId}`, 'g'), '');
        updateGhostmodeTopics(api, newGhostmodeTopics);
        alert(`Topic ID ${topicId} Removed`);
    } else {
        // Add topic ID
        const newGhostmodeTopics = `${currentGhostmodeTopics ? currentGhostmodeTopics + '|' : ''}${topicId}`;
        updateGhostmodeTopics(api, newGhostmodeTopics);
        alert(`Topic ID ${topicId} Added`);
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
