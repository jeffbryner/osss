import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';
//collections shared by client/server
Meteor.startup(() => {
    solutions = new Meteor.Collection("solutions");
    tags = new Meteor.Collection("tags");

    models={
        solution: function() {
            return {
                name:"",
                description: "",
                tags:[]
            };
        }
    }

    if (Meteor.isServer) {

        //Publish collections
        Meteor.publish('solutions', function allSollutions(){
            return solutions.find();
        });
        Meteor.publish('solution',function aSolution(id){
            return solutions.findOne({_id:id});
        })

        Meteor.publish('tags', function(){
            return tags.find();
        })

        // permissions, bare bones for now
        solutions.allow({
            insert: function (userId, doc) {
                return (true);
            },
            update: function (userId, doc, fields, modifier) {
                return (true);
            },
            remove: function (userId, doc) {
                return (true)
            }
        });
        tags.allow({});

    }

    if (Meteor.isClient) {
        //client-side subscriptions to low volume collections
        Meteor.subscribe("solutions");
        Meteor.subscribe("tags");
    };

});