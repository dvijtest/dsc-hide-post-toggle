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

                //console.log('model',model);

                //const showButtonElement = document.querySelector('[title="[en.button_title.show_post]"]');
                //const showButtonElement = document.querySelector(`[data-post-id="${postId}"] [title="[en.button_title.show_post]"]`);
                //console.log('showButtonElement', showButtonElement);

                //const showButtonParentElement = showButtonElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                //console.log('showButtonParentElement', showButtonParentElement);

                //const hideButtonElement = document.querySelector(`[data-post-id="${postId}"] [title="[en.button_title.hide_post]"]`);
                //console.log('hideButtonElement', hideButtonElement);

                //const current_postId = showButtonParentElement.id;
                //const current_data_post_id = showButtonParentElement.getAttribute('data-post-id');
                //const current_postauthor = model.user_id;

                const dataPostId = document.querySelector(`[data-post-id="${postId}"]`);
                //console.log('dataPostId',dataPostId);

                const dataPostIdParent = dataPostId.parentElement;
                //console.log('dataPostIdParent',dataPostIdParent);


                const siteSettings = api.container.lookup('site-settings:main');
                const ghostmode_posts = siteSettings.ghostmode_posts;
                const ghostmode_topics = siteSettings.ghostmode_topics;

                const isPostHidden = ghostmode_posts.includes(postId);
                //console.log('isPostHidden', isPostHidden);

                const isTopicsHidden = ghostmode_topics.includes(postId);
                //console.log('isTopicsHidden', isTopicsHidden);

                const isTopicHidden = ghostmode_posts.includes(topicId);

                //showButtonElement.toggle('far-eye', isPostHidden);
                //showButtonElement.title = isPostHidden ? 'button_title.show_post' : 'button_title.hide_post';

                const newGhostModePosts = postId;

                /*showButtonElement.addEventListener('click', function () {
                    console.log('newGhostModePosts after Click', newGhostModePosts);
                    if (isPostHidden === false) {
                        addSetting(api, newGhostModePosts);
                        //showButtonParentElement.style.backgroundColor = "red";
                        alert(`Id : ${newGhostModePosts} Added`);
                    } else {
                        removeSetting(api, newGhostModePosts);
                        //showButtonParentElement.style.backgroundColor = "yellow";
                        alert(`Id : ${newGhostModePosts} Removed`);
                    }
                });*/

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
                //console.log("Add Post Menu Button", isPostHidden);
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
                //action: (toggleHideTopic(api,topicId))
                action(){
                    const model = this.attrs;
                    //console.log('model in ',model.topic.value.id);
                    const topicId = model.topic.value.id;
                    toggleHideTopic(api,topicId);
                }
                });
            //

        });
    },
};

function addSetting(api, postId) {
    //console.log('Adding setting', postId, api);
    const controller = api.container.lookup('site-settings:main');
    //console.log('Controller', typeof (controller), controller.ghostmode_posts);

    const newGhostmodePosts = `${controller.ghostmode_posts ? controller.ghostmode_posts + '|' : ''}${postId}`;
    //console.log('newGhostmodePosts', newGhostmodePosts);

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
    //console.log('Removing setting', postIdToRemove, api);

    const controller = api.container.lookup('site-settings:main');
    const currentGhostmodePosts = controller.ghostmode_posts || '';
    const currentPostIds = currentGhostmodePosts.split('|');

    // Remove the postId to delete
    const updatedPostIds = currentPostIds.filter(id => id !== postIdToRemove);
    //console.log("updatedPostIds", updatedPostIds);

    //const newGhostmodePosts = updatedPostIds.join('|');
    const newGhostmodePosts = controller.ghostmode_posts.replace(new RegExp(`\\|${postIdToRemove}`, 'g'), '');
    //console.log('newGhostmodePosts', newGhostmodePosts);

    // Update the ghostmode_posts setting
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
    const currentTopicIds = currentGhostmodeTopics.split('|');

    const isTopicHidden = currentTopicIds.includes(topicId);
    //console.log("isTopicHidden", isTopicHidden);

    if (isTopicHidden) {
        // Remove topic ID
        const updatedTopicIds = currentTopicIds.filter(id => id !== topicId);
        //console.log('Removing topic',updatedTopicIds);
        const newGhostmodeTopics = controller.ghostmode_topics.replace(new RegExp(`\\|${topicId}`, 'g'), '');
        //console.log('Removing topic',newGhostmodeTopics);
        updateGhostmodeTopics(api, updatedTopicIds);
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
