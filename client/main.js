import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '/imports/collections.js';
import './main.html';

Router.route('/', function () {
    this.render('osss');
  });

Template.solutions.events({
    "click .solution-add": function(event,template){
        $('#modal_solution_form').modal();
    },
    "click .solution-edit": function(event,template){
        $('#modal_solution_form').modal();
        editSolution=models.solution();
        editSolution=solutions.findOne({'_id':this._id});
        template.find("#_id").value=editSolution._id;
        template.find("#name").value=editSolution.name;
        template.find("#description").value=editSolution.description;
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
    "submit form": function(event, template) {
        window.t=template;
        event.preventDefault();
        this_solution=models.solution();

        this_solution.name=template.find("#name").value;
        this_solution.description=template.find("#description").value;
        if ( _.isEmpty(template.find("#_id").value) ){
            solutions.insert(this_solution);
        }else{
            solutions.update({ _id: template.find("#_id").value}, this_solution )
        }
        $('#modal_solution_form').modal('hide')
    }
});
