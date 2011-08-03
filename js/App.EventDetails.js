/***********Event Details************/
rol.EventDetails = Ext.extend(Ext.Panel, {
    fullscreen: true,
    scroll: 'vertical',
    cls: 'detailsPnl',
    id: '_eventDetails',
    tpl: [
                 '<tpl for=".">',
                 '<div class="dash">',
                    '<div class="eventMeta">',
                        '<strong class="eventTitle">{Title}</strong>',
                         '<div class="statLine">#{ID}</div>',
                         '<div class="statLine">{[rol.Main.FormatDate(values.StartDate)]}</div>',
                         '<div class="statLine">{City} {State}</div>',
                    '</div>',
                    '<div class="stats">',
                        '<div class="box" onclick="rol.Main.app.attendeeList.Load(0);">',
                                '<div class="lrgval">{TotalRegistrations}</div>',
                                 '<div class="lbl">Registrations</div>',
                        '</div>',

                         '<div class="chart"><span id="evtChart">loading chart data...</span></div>',
                     '</div>',
                '</div>',
                '</tpl>'
            ],
    dockedItems: [{
        //actions
        xtype: 'toolbar',
        dock: 'bottom',
        cls: 'toolBar',
        layout: {
            pack: 'center'
        },
        items: [
                        {
                            //schedule
                            icon: 'img/calendarIcon.png',
                            ui: 'plain',
                            text: 'Schedule',
                            handler: function() {
                                rol.Main.app.agenda.Load();
                            }
                        },
                        {
                            //attendee list
                            iconCls: 'x-btn-text-icon',
                            icon: 'img/attendeeIcon.png',
                            ui: 'plain',
                            text: 'Attendees',
                            handler: function() {
                                rol.Main.app.attendeeList.Load(0);
                            }
                        }
                    ]
}],
        Load: function(id) {
            console.log(id + ":" + rol.Main.EventID);
            if (id != null && rol.Main.EventID != id) {
                rol.Main.EventID = id;
                //clear attendeeStore
                data.Access.loadEventStats(rol.Main.EventID);
            }
            //load attendee List for charting
            data.Access.loadAttendees(rol.Main.EventID, 0);
            rol.Main.app.loadCard(this, null);

            rol.Main.loadEventChart();
        },
        Bind: function(data) {
            rol.Main.app.setTitle(data[0].Title);
            rol.Main.app.EventTitle = data[0].Title;
            this.update(data[0]);
        },
        ToggleAttendeeButton: function(show) {
            if (show) {
                this.dockedItems.items[0].items.items[1].show();
            }
            else {
                this.dockedItems.items[0].items.items[1].hide();
            }
        }
    });

    /***********Event Details************/