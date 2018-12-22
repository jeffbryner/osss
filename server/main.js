import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/meteor';
import '/imports/collections.js';
import { aggregate } from 'meteor/sakulstra:aggregate';
import { URL } from 'url';

Meteor.startup(() => {
    // code to run on server at startup
    //update tags if missing:
    console.log("checking the tags");
    console.log('tags: ' + tags.find().count());
    if (tags.find().count() == 0) {
        console.log("updating the tags collection");
        var tagsFile = Assets.getText("tags.txt");
        var tagsObject = tagsFile.split("\n");
        tagsObject.forEach(function (tagItem) {
            tags.insert({ tag: tagItem });
        });
    }
});

Meteor.methods({
    'aggregateTags': aggregateTags
});

function aggregateTags() {
    // aggregate the solutions table returning tags and solution name
    // for use in the pivot UI
    var pipeline = [
        {"$match":{"tags":{"$exists":true}}},
        {"$unwind": "$tags"},
        {"$project": {"name": 1,
                        "tags": 1,
                        "health":1,
                        "_id": 0
                        }}
        ]
    var result = solutions.aggregate(pipeline);
    return result;
}
