import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/meteor';
import '/imports/collections.js';
import { aggregate } from 'meteor/sakulstra:aggregate';


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
    console.log("aggregating");
    var pipeline = [
      {$group: {_id: null, resTime: {$sum: "$resTime"}}}
    ];
    var pipeline = [

        {"$match":{"tags":{"$exists":true}}},
        {"$unwind": "$tags"},
        {"$project": {"name": 1,
                        "tags": 1,
                        "_id": 0
                        }}
        ]
    var result = solutions.aggregate(pipeline);
    //console.log("Explain Report:", JSON.stringify(result[0]), null, 2);
    return result;
}
