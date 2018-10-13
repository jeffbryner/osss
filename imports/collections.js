import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';
//collections shared by client/server
Meteor.startup(() => {
    solutions = new Meteor.Collection("solutions");
    tags = new Meteor.Collection("tags");
});

models={
    solution: function() {
        return {
            name:"",
            description: "",
            tags:[]
        };
    }
}