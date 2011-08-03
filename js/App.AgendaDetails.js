/***********Agenda Details************/
rol.AgendaDetails = Ext.extend(Ext.Panel, {
    fullscreen: true,
    scroll: 'vertical',
    cls: 'agendaDetails',
    id: '_agendaDetails',
    cfid: null,
    tpl: [
                         '<tpl for=".">',
                            '<div class="agendaItemDetails">',
                                '<h2>{FormattedName}</h2>',
                                '<ul>',
                                    '<li>',
                                        '{[rol.Main.FormatDate(values.StartDate)]} ',
                                        '{[rol.Main.FormatTime(values.StartDate)]}',
                                        '<tpl if="values.EndDate != null && values.EndDate != \'\'">',
                                            ' - ',
                                        '</tpl>',
                                        '<tpl if="String([rol.Main.FormatDate(values.StartDate)]) != String([rol.Main.FormatDate(values.EndDate)])">',
                                            '{[rol.Main.FormatDate(values.EndDate)]} ',
                                        '</tpl>',
                                    '{[rol.Main.FormatTime(values.EndDate)]}</li>',
                                    '<li>{Location}</li>',
                                '</ul>',
                             '</div>',
                             '<div class="agendaItemDetails center">',
    // TODO: Wire this up
                                '<h2><span id="sessionCount"></span></h2>',
                                '<br/>Registrations',
                             '</div>',
                             '<div class="agendaItemDetails center">',
                                '<div class="chart"><span id="sessionChart"></span></div>',
                             '</div>',
                        '</tpl>'
                        ],

    dockedItems: [
                {//actions
                    xtype: 'toolbar',
                    dock: 'bottom',
                    cls: 'toolBar',
                    layout: {
                        pack: 'center'
                    },
                    items: [
                        {//attendee list
                            icon: 'img/attendeeIcon.png',
                            ui: 'plain',
                            text: 'Attendees',
                            handler: function() {
                                rol.Main.app.attendeeList.Load(rol.Main.app.agendaDetails.cfid);
                            }
                        }
                    ]
                }
         ],
    initComponent: function() {
        rol.AgendaDetails.superclass.initComponent.call(this);
    },
    Load: function(id) {
        if (id != null) {
            this.cfid = id
        }
        //data.Access.loadAttendees(rol.Main.EventID, this.cfid);
        rol.Main.app.loadCard(this, null);
        data.Access.loadAgendaDetails(this.cfid, rol.Main.EventID);
    },
    Bind: function(data) {
        this.update(data);
    },
    UpdateCheckinStatus: function(attendees, success) {
        if (success) {
            // Loop through and update the status for the attendees who were checked in
            if (rol.Main.app.agendaResponseStore != null) {
                var attArr = attendees.split(',');
                for (j = 0; j < attArr.length; j++) {
                    for (i = 0; i < rol.Main.app.agendaResponseStore.data.length; i++) {
                        console.log(rol.Main.app.agendaResponseStore);
                        var id = rol.Main.app.agendaResponseStore.data.items[i].get('ID');
                        if (id == attArr[j]) {
                            rol.Main.app.agendaResponseStore.data.items[i].set('StatusDescription', 'Attended');
                            //console.log(id + ' status changes');
                        }
                    }
                }
            }
            rol.Main.loadSessionChart();
            rol.Main.app.onError('<div class="errorText success">Successfully Checked-In Selected Attendee(s)</div>');
        } else {
            rol.Main.app.onError('<div class="errorText fail">Failed to Checkin-In Selected Attendee(s)</div>');
        }
        this.Load(this.cfid, '');
    },

});

/***********Agenda Details************/