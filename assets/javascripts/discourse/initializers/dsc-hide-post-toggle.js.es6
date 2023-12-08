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

                const buttonElement = document.querySelector('[title="[en.button_title.show_post]"]');
                const buttonParentElement = buttonElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

                const current_postId = buttonParentElement.id;
                const current_data_post_id = buttonParentElement.getAttribute('data-post-id');
                const current_postauthor = model.user_id;

                const siteSettings = api.container.lookup('site-settings:main');
                const ghostmode_posts = siteSettings.ghostmode_posts;

                const isPostHidden = ghostmode_posts.includes(postId);

                /*
                console.log('isPostHidden', isPostHidden);

                console.log('current user', currentUser);
                console.log('model', model);
                console.log('postId', postId);
                console.log('current Id', current_postId);
                console.log('current Post Id', current_data_post_id);
                console.log('currentPostAuthor', current_postauthor);
                console.log('current user id', model.user_id);
                console.log('siteSettings->ghostmode_posts', ghostmode_posts); */

                buttonElement.addEventListener('click', function () {
                    const newGhostModePosts = postId;
                    //console.log('newGhostModePosts', newGhostModePosts);

                    addSetting(api, newGhostModePosts);
                    alert(`Id : ${newGhostModePosts} Added`);
                    //alert("ID added successfully")
                });
            });

            api.addPostMenuButton('toggleHidePost', (model) => {
                //const siteSettings = api.container.lookup('site-settings:main');
                //const ghostmode_posts = siteSettings.ghostmode_posts;
                //const isPostHidden = ghostmode_posts.includes(model.id);
                const isHidden = model.cooked_hidden;
                return {
                    action: 'toggleHidePost',
                    icon: isHidden ? 'far-eye-slash' : 'far-eye',
                    title: isHidden ? 'button_title.hide_post' : 'button_title.show_post',
                    position: 'second-last-hidden',
                };
            });
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



/*

*/
