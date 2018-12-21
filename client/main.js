import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '/imports/collections.js';
import 'meteor/alexwine:bootstrap-4';
import './layout.html';
import './main.html';
import './tags.html';
import './pivot.html';
import './pivot.js';

Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', function () {
    this.render('osss');
});

Router.route('/solutions/:_id', function () {
    // grab the data for the form
    var solution = solutions.findOne({_id: this.params._id});
    this.render('solution_form', {data: solution});
});

Router.route('/pivot', function () {
    this.render('pivotTable');
});

UI.registerHelper('stringify',function(obj) {
    //given a json objects, simply stringify it
    return JSON.stringify(obj,null,2);
 });

UI.registerHelper('healthColor',function(obj){
    //given a health rating, return a css color
    if (obj=='unknown'){
        return 'bg-light';
    }
    if (obj=='green'){
        return 'bg-success';
    }
    if (obj=='red'){
        return 'bg-danger'
    }

});

Template.solutions.onCreated(function(){
    this.autorun(() => {
        this.subscribe('solutions');
    });
});

Template.solutions.events({
    "click .solution-add": function(event,template){
        //create a new, empty solution
        Session.set('solutionID',null);
        newSolution=models.solution();
        new_id=solutions.insert(newSolution);
        Session.set('solutionID',new_id);
        //route to it for editing
        Router.go('/solutions/' + Session.get('solutionID'));

    },
    "click .solution-edit": function(event,template){
        Session.set('solutionID',this._id);
        Router.go('/solutions/' + Session.get('solutionID'));

    },
    "click .solution-delete": function(e){
        id = $(e.target).attr('data-solutionid');
        solutions.remove({'_id':id});
        e.preventDefault();
    },
});

//return all records
Template.solutions.helpers({
    solutions: function () {
        return solutions.find({},{
                                sort: {name: 1}
                            });
    }
});

Template.solution_form.events({
    // input isn't enough since toolbar changes don't trigger
    'input .solution_form': _.debounce(function(e,template){
        //console.log('editor debounce input', template);
        //window.tmpl=template;
        this_solution=models.solution();
        // we don't rate the health
        delete this_solution.health;
        this_solution.name=template.find("#name").value;
        this_solution.description=template.find("#description").value;
        this_solution.url=template.find("#url").value;
        var tags = _.pluck($('.form-control .tag'),'childNodes')
        tags.forEach(function(t){
            this_solution.tags.push(t[0].data);
        });
        solutions.update({ _id: template.data._id}, {$set: this_solution });
    } , 500),

    "dragover .tags": function(e){
        e.preventDefault();   //allow the drag
    },
    "keyup .tagfilter":function(e,template){
        //var letter_pressed = String.fromCharCode(e.keyCode);
        console.log(template.find("#tagfilter").value);
        Session.set('tagfilter',template.find("#tagfilter").value);

    },
    "drop .tags": function(e){
        e.preventDefault();
        tagtext = e.originalEvent.dataTransfer.getData("text/plain");
        //e.target.textContent=droptag
        //console.log(tagtext)
        if ( Session.get('solutionID') ){
            solutions.update({ _id: Session.get('solutionID')},
             {$addToSet: {tags:tagtext}
            });
        }
    },
    "click .tagdelete": function(e){
        tagtext = e.target.parentNode.firstChild.wholeText;
        solutions.update(Session.get('solutionID'), {
            $pull: {tags:tagtext}
        });
    },
});


Template.tags.helpers({
    tags: function() {
        return tags.find({tag:{$regex:'.*' +Session.get('tagfilter') + '.*',$options:'i'}},{limit:50});
    }
});

Template.tags.events({
    'dragstart .tag': function(e){
        e.originalEvent.dataTransfer.setData("text/plain",this.tag);
    },
    'load': function(e, template){
        template.find("#tagfilter").value=Session.get('tagfilter');
    },
    'click li': function(e,template){
        Session.set('tagfilter',e.target.textContent);
        template.find("#tagfilter").value=e.target.textContent;
    }
});