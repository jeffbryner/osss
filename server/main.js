import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/meteor';
import '/imports/collections.js';
import { aggregate } from 'meteor/sakulstra:aggregate';
import { URL } from 'url';
const github = require('@octokit/rest')()

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
    'aggregateTags': aggregateTags,
    'getgithubstats': getGithubStats
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

function getGithubStats(id){
    asolution=solutions.findOne({_id:id});
    //try {
        if ( asolution.url ){
            aurl = new URL(asolution.url);
            if ( aurl.hostname == 'github.com' ){
                //console.log('creating github api object for ' + aurl.pathname);
                gituser=aurl.pathname.split('/')[1];
                gitrepo=aurl.pathname.split('/')[2];
                //console.log(gituser,gitrepo);
                const octokit = require('@octokit/rest')()

                // releases
                // POC code to rate a project
                // healthy if it has an arbitrary min number of releases
                octokit.repos.getReleases ({
                    owner: gituser,
                    user: gituser,
                    repo: gitrepo
                }).then(({ data, headers, status }) => {
                    //console.log(id);
                    //console.log(JSON.stringify(data.length));
                    releases=data.length;
                    if (releases >= 5){
                        solutions.update({_id:id}, {$set:{health:'green'}});
                    }
                    if (releases <5){
                        solutions.update({_id:id}, {$set:{health:'red'}});
                    }
                });
            }
        }
    //} catch (err) {
    //     console.log('get GitHub stats errored: ') + JSON.stringify(err);
   // }
}