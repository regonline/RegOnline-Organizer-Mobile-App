/***********Attendee Record************/
rol.attendeeDetails = Ext.extend(Ext.TabPanel, {
    title: 'attendee',
    cls: 'detailsPnl',
    id: '_attendeeDetails',
    k: null,
    eventId: null,
    layout: 'fit',
    isLoaded: false,
    isAgendaLoaded: false,
    tabBar: {
        dock: 'bottom',
        ui: 'light',
        cls: 'footerBar',
        layout: {
            pack: 'center'
        }
    },
    items: [{
        title: 'Details',
        id: 'aDetailsTab',
        iconCls: 'user',
        scroll: 'vertical',
        tpl: [
                              '<tpl for=".">',
                                    // Top Details
                                    '<div class="attendeeMeta">',
                                        '<div class="attendeeName">',
                                                '<div class="lbl">{LastName}, {FirstName}</div>',
                                                '<div class="statusBox {StatusDescription}">{StatusDescription}</div>',
                                        '</div>',
                                        '<ul>',
                                            '<li>#{ID}</li>',
                                            '<li><a href="mailto:{Email}">{Email}</a></li>',
                                            '<li><strong>Balance Due: {BalanceDue}</strong></li>',
                                        '</ul>',
                                    '</div>',

                                    // Personal Info
                                    '<div class="x-list"><div class="x-list-group">',
                                        '<h3 class="subTitle">Personal Information</h3>',
                                    '</div>',
                                    '<div class="attendeeMeta">',
                                        '<ul>',
                                            '<li><strong>Phone:</strong> {Phone}</li>',
                                            '<li><strong>Company:</strong> {Company}</li>',
                                            '<li><strong>Address Line 1:</strong> {Address1}</li>',
                                            '<li><strong>Address Line 2:</strong> {Address2}</li>',
                                            '<li><strong>City/State/Zip:</strong> {City}, {State} {PostalCode}</li>',
                                        '</ul>',
                                    '</div>',
                                    '<div id="btnCheckin"></div>',
                                '</tpl>'
                                ]
    },
                    {
                        title: 'Schedule',
                        id: 'aScheduleTab',
                        iconCls: 'maps',
                        xtype: 'list',
                        itemTpl: [
                        '<tpl for=".">',
                            '<div class="agendaItem ">',
                                '<h4>{CustomFieldFormattedName}</h4>',
                                '<ul>',
                                     '<li>',
                                        '{[rol.Main.FormatDate(values.CustomFieldStartDate)]} ',
                                        '{[rol.Main.FormatTime(values.CustomFieldStartDate)]}',
                                        '<tpl if="values.CustomFieldEndDate != null">',
                                            ' - ',
                                        '</tpl>',
                                        '<tpl if="String([rol.Main.FormatDate(values.CustomFieldStartDate)]) != String([rol.Main.FormatDate(values.CustomFieldEndDate)])">',
                                            '{[rol.Main.FormatDate(values.CustomFieldEndDate)]} ',
                                        '</tpl>',
                                    '{[rol.Main.FormatTime(values.CustomFieldEndDate)]}</li>',
                                    '<li>{Location}</li>',
                                    '<tpl if="IsWaitlisted == true">',
                                        '<li><span class="waitlisted">(waitlisted)</span></li>',
                                    '</tpl>',
                                '</ul>',
                             '</div>',
                        '</tpl>'
                    ],
                        grouped: true,
                        singleSelect: true,
                        emptyText: '<div class="empty">No records to display</div>',
                        itemSelector: '.agendaItem',
                        store: new Ext.data.JsonStore({
                            model: 'CoreAgendaList'
                        }),
                        onAgendaSelect: function(dv, i, item, e) {
                            var ds = dv.getStore();
                            var r = ds.getAt(i);
                            rol.Main.app.agendaDetails.Load(r.get('ID'));
                        },
                        Bind: function(store) {
                            console.log('loading attendee schedule');
                            var count = store.getCount();
                            this.bindStore(store);
                        }
}]
                ,
    Load: function(id) {
        if (id > 0 && id != this.attendeeId) {
            this.attendeeId = id;
            this.isLoaded = false;
        }

        this.isAgendaLoaded = false;
        rol.Main.app.loadCard(rol.Main.app.attendeeDetails, null);
        if (!this.isLoaded) {
            data.Access.loadAttendee(id);
            this.isLoaded = true;
        }
    },
    Checkin: function() {
        data.Access.checkinAttendees(this.attendeeId);
        data.Access.loadAttendee(this.attendeeId);
    },
    Agenda: function() {
        if (!this.isAgendaLoaded) {
            data.Access.loadAttendeeSchedule(rol.Main.EventID, this.attendeeId);
            this.isAgendaLoaded = true;
        }
    }
});


/***********Attendee Record************/