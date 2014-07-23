/*
* Mobile Only Text
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Ryan Lafferty <ryanl@learningpool.com>
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    function setupMobileOnlyView(pageModel, enabledMobileComponents) {

        //Creates a MobileOnlyText view for each of the components passed in.
        var MobileOnlyView = Backbone.View.extend({
            initialize: function() {
                this.listenTo(this.model, 'change:_isReady', function() {
                    for (var i = 0; i < enabledMobileComponents.length; i++) {
                        new MobileOnlyText({model: enabledMobileComponents[i]});
                    }
                });
            },
        });

        var MobileOnlyText = Backbone.View.extend({

            initialize: function() {
                this.listenTo(Adapt, 'remove', this.remove);
                this.listenTo(Adapt, 'device:resize', this.render);
                this.render();
            },

            render: function () {
                /*
                When the screen size is small, check to see if the class that would 
                identify a mobile text component exists. If it doesn't exist, 
                a handlebars template will be appended to the component using the 
                data from components.json
                */
                if (Adapt.device.screenSize == "small") {
                    var selector = '.' + this.model.get('_id');
                    selector += ".mobileOnly";
                    if(!($(selector)[0])){
                        var template = Handlebars.templates["mobileOnlyText"];
                        var data = this.model.attributes;
                        
                        var componentID = '.' + this.model.get('_id');
                        var $component = $(componentID);

                        $component.append(this.$el.html(template(data)));
                    }
                }
                //If the screen size isn't small, every mobile only component is removed.
                else {
                    $(".mobileOnly."+this.model.get("_id")).remove();
                }
            }
        });

        new MobileOnlyView({model: pageModel});
    }

    Adapt.on('router:page', function(pageModel) {

        /*
        Finds all enabled components then filters out the ones that have the _mobileText
        attribute. Calls setupMobileOnlyView on these filtered components.
        */
        var currentMobileComponents = pageModel.findDescendants('components').where({'_isAvailable': true});

        var enabledMobileComponents = _.filter(currentMobileComponents, function(component) {
            if (component.attributes._mobileText) {
                return component.attributes._mobileText._isEnabled;
            }
        });

        if (enabledMobileComponents.length > 0) {
            setupMobileOnlyView(pageModel, enabledMobileComponents);
        }
    });
})