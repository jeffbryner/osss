import { Meteor } from 'meteor/meteor';
import '/imports/collections.js';

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
