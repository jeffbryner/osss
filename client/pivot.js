 /*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
Copyright (c) 2014 Mozilla Corporation
 */
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating';
import d3 from 'd3';
import 'jquery-ui/ui/data';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/scroll-parent';
import 'jquery-ui/ui/widgets/mouse';
import 'jquery-ui/ui/widgets/sortable';
import pivotUI from 'pivottable';
import 'pivottable/dist/pivot.css';
import './pivot.html';

Template.pivotTable.rendered = function () {
    var container=document.getElementById('pivot-wrapper')
    container.style.cursor='wait';

    Meteor.apply('aggregateTags',
        [],
        onResultReceived = function(err,result){
            // console.log(result);
            this.tableData= result;
            $("#pivot-wrapper").pivotUI(
                this.tableData,
                {
                    cols: ["tags"],
                    rows: ["name"],
                    menuLimit: 500
                });
    });
    container.style.cursor='auto';
}