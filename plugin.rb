
# name: dsc-hide-post-toggle
# about: Toggle button to hide/show posts, visible to admins
# version: 0.7
# authors: dvijtest
# url: null

register_asset "javascripts/discourse/initializers/dsc-hide-post-toggle.js.es6"
register_asset "stylesheets/dsc-hide-post-toggle.scss"

enabled_site_setting :discourse_hide_post_toggle_enabled

#load File.expand_path('../lib/dsc-hide-post-toggle/engine.rb', __FILE_



after_initialize do

    module ::DiscourseShadowbanTopicView

      def filter_post_types(posts)
        result = super(posts)
        if SiteSetting.ghostmode_show_to_staff && @user&.staff?
          result
        else
          posts_list = SiteSetting.ghostmode_posts.split('|')
          result.where(
            '(
              posts.user_id = ?
              OR 
              (
                posts.id NOT IN (?)
                AND posts.user_id IN 
                  (
                    SELECT id from users u where u.admin = ?
                  )
                AND 
                ( 
                  posts.reply_to_post_number IN 
                    (
                      SELECT post_number FROM posts p WHERE p.user_id = ? AND p.topic_id = ?
                    )
                  OR posts.reply_to_post_number IS NULL
                )
              )
              OR
              (
                posts.user_id NOT IN 
                  (
                    SELECT id from users u where u.admin = ?
                  )
                AND posts.id NOT IN (?)
              )
            )',
            @user&.id || 0,
            posts_list,
            true,
            @user&.id || 0,
            @topic&.id || 0,
            true,
            posts_list
          )
        end
      end
    end
  
    class ::TopicView
      prepend ::DiscourseShadowbanTopicView
    end
  
    module ::DiscourseShadowbanTopicQuery
      def default_results(options = {})
        result = super(options)
        if SiteSetting.ghostmode_show_to_staff && @user&.staff?
          result
        else
          result.where(
            '(topics.id NOT IN (?) OR topics.user_id = ?)',
            SiteSetting.ghostmode_topics.split('|'),
            @user&.id || 0
          )
        end
      end
    end
  
    class ::TopicQuery
      prepend ::DiscourseShadowbanTopicQuery
    end
  
    # module ::DiscourseShadowbanPostAlerter
    #   def create_notification(user, type, post, opts = {})
    #     if (SiteSetting.ghostmode_show_to_staff && user&.staff?) || SiteSetting.ghostmode_posts.split('|').find_index(@post.id).nil?
    #       super(user, type, post, opts)
    #     end
    #   end
    # end
  
    # class ::PostAlerter
    #   prepend ::DiscourseShadowbanPostAlerter
    # end
  
    # module ::DiscourseShadowbanPostCreator
    #   def update_topic_stats
    #     if SiteSetting.ghostmode_topics.split('|').find_index(@post.id).nil?
    #       super
    #     end
    #   end
    # end
  
    # class ::PostCreator
    #   prepend ::DiscourseShadowbanPostCreator
    # end
  end
  