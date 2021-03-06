import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';
import { publishPagination } from 'meteor/kurounin:pagination';

//collections shared by client/server
Meteor.startup(() => {
    solutions = new Mongo.Collection("solutions");
    tags = new Mongo.Collection("tags");

    models={
        solution: function() {
            return {
                name:"",
                description: "",
                url:"",
                tags:[],
                health:"pending"
            };
        }
    }

    if (Meteor.isServer) {
        solutions.rawCollection().dropIndexes();
        solutions.rawCollection().createIndex({
            name: "text",
            description: "text",
            tags: "text"
        });

        //Publish collections
        publishPagination(solutions);
        Meteor.publish('solution',function(id){
            return solutions.find({_id:id});
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
        //Meteor.subscribe("solutions");
        Meteor.subscribe("tags");
    };

});