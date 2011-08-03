/***********Data************/


data.Access = {
    //Login
    login: function (u, p) {
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
        $.ajax({
            url: rol.Main.BaseServicesURL + '/Login',
            dataType: 'jsonp',
            data: {
                'username': JSON.stringify(u),
                'password': JSON.stringify(p)
            },
            method: 'GET',
            headers: { 'Content-Type': 'application/json;charset=utf-8',
                'Mobile-Request': 'true'
            },
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;
                var isAuthorized = jsonData.Success;

                if (isAuthorized) {
                    rol.Main.SessionID = jsonData.EventSessionId;
                    rol.Main.APIToken = jsonData.APIToken;
                    rol.Main.CustomerID = jsonData.CustomerId;
                    rol.Main.UserName = u;
                    rol.Main.app.eventList.Load();
                }
                else {
                    rol.Main.app.onError('Invalid Login');
                }
            },
            failure: function (response, opts) {
                console.log(response.statusText);
            }
        });
    },
    //LOAD EVENT LIST
    loadEvents: function () {
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');

        $.ajax({
            url: rol.Main.BaseServicesURL + '/GetEvents',
            dataType: 'jsonp',
            data: {
                'filter': JSON.stringify('(TypeID==1 OR TypeID==9) AND (IsActive==true OR IsOnSite==true) AND (EndDate.Value>=DateTime.Now OR !EndDate.HasValue)'),
                'orderBy': JSON.stringify(''),
                'APIToken': rol.Main.APIToken,
                'Mobile-Request': 'true'
            },
            method: 'GET',
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;
                var store = new Ext.data.Store({
                    model: 'EventList',
                    sorters: 'Title',
                    getGroupString: function (record) {
                        return record.get('Title')[0].toUpperCase();
                    },
                    data: jsonData
                });
                rol.Main.app.eventList.Bind(store);
            },
            failure: function (response, opts) {
                console.log(response.responseText);
            }
        });
    },
    loadEventStats: function (eventID) {
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
        $.ajax({
            url: rol.Main.BaseServicesURL + '/GetEventStatistics',
            dataType: 'jsonp',
            data: {
                'EventID': JSON.stringify(eventID),
                'APIToken': rol.Main.APIToken,
                'Mobile-Request': 'true'
            },
            method: 'GET',
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;

                rol.Main.app.eventDetails.Bind(jsonData);
                rol.Main.currentEvent = jsonData[0];

                // Hide the registration related functions if there are none
                if (rol.Main.currentEvent.TotalRegistrations == 0) {
                    Ext.getDom('evtChart').innerHTML = '';
                    rol.Main.app.eventDetails.ToggleAttendeeButton(false);
                }
                else {
                    rol.Main.app.eventDetails.ToggleAttendeeButton(true);
                }
            },
            failure: function (response, opts) {
                console.log(response.statusText);
            }
        });
    },
    loadAgendaDetails: function (id, eventID) {

        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');

        var index = rol.Main.app.agendaListStore.find('ID', id);
        var cf = rol.Main.app.agendaListStore.getAt(index);
        rol.Main.app.agendaDetails.cfid = id;
        rol.Main.CFID = id;
        rol.Main.app.agendaDetails.Bind(cf.data);

        // Load all of the responses for the graph
        $.ajax({
            url: rol.Main.BaseServicesURL + '/GetCustomFieldResponses',
            dataType: 'jsonp',
            data: {
                'eventID': JSON.stringify(eventID),
                'cfid': JSON.stringify(id),
                'orderBy': JSON.stringify(''),
                'APIToken': rol.Main.APIToken,
                'Mobile-Request': 'true'
            },
            method: 'GET',
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;

                rol.Main.app.agendaResponseStore = new Ext.data.ArrayStore({
                    model: 'ResponseList',
                    sorters: [{ property: 'Response', direction: 'DESC'}],
                    groupDir: 'DESC',
                    getGroupString: function (record) {
                        return record.get('CustomFieldStatus');
                    }
                });
                rol.Main.app.agendaResponseStore.loadData(jsonData);
                rol.Main.loadSessionChart();

                Ext.getDom('sessionCount').innerHTML = rol.Main.app.agendaResponseStore.data.items.length;
            },
            failure: function (response, opts) {
                console.log(response.responseText);
            }
        });

        Ext.getBody().unmask();

    },
    loadAttendees: function (eventID, cfid) {
        var reload = true;
        if (rol.Main.app.attendeeListStore != null) {
            if ((rol.Main.app.attendeeListStore.proxy != null) && (rol.Main.app.attendeeListStore.proxy.id == (JSON.stringify(eventID) + '_' + JSON.stringify(cfid)))) {
                reload = false;
                //console.log('reloading attendeeListStore from local store');
                rol.Main.app.attendeeListStore.sort([{ property: 'StatusDescription', direction: 'DESC' }, { property: 'LastName', direction: 'ASC'}]);
                rol.Main.app.attendeeList.Bind(rol.Main.app.attendeeListStore);
            }
        }
        if (reload) {
            //TO DO: Clean up session storage to avoid memeroy bloat      
            Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
            $.ajax({
                url: getAttendeeURL(cfid),
                dataType: 'jsonp',
                data: {
                        'eventID': JSON.stringify(eventID), 
                        'filter': JSON.stringify(''), 
                        'cfid': JSON.stringify(cfid),
                        'orderBy': JSON.stringify(''),
                        'APIToken': rol.Main.APIToken,
                        'Mobile-Request': 'true'
                },
                method: 'GET',
                success: function (response, opts) {
                    Ext.getBody().unmask();
                    Ext.data.ProxyMgr.registerType('sessionstorage', Ext.data.SessionStorageProxy);
                    var jsonData = response.d.Data;

                    if (rol.Main.app.attendeeListStore != null) {
                        //console.log('clearing attendeeListStore');
                        rol.Main.app.attendeeListStore.proxy.clear();
                        rol.Main.app.attendeeListStore = null;
                    }
                    rol.Main.app.attendeeListStore = new Ext.data.Store({
                        proxy: {
                            type: 'sessionstorage',
                            id: (JSON.stringify(eventID) + '_' + JSON.stringify(cfid))
                        },
                        model: 'AttendeeList',
                        sorters: [{ property: 'StatusDescription', direction: 'DESC' }, { property: 'LastName', direction: 'ASC'}],
                        groupDir: 'DESC',
                        getGroupString: function (record) {
                            return record.get('StatusDescription');
                        }
                    });
                    //console.log('loading attendeeListStore ');
                    if (jsonData) {
                        rol.Main.app.attendeeListStore.loadData(jsonData);
                        rol.Main.app.attendeeList.EventID = eventID;
                        rol.Main.app.attendeeList.cfid = cfid;
                        rol.Main.app.attendeeList.Bind(rol.Main.app.attendeeListStore);
                    }
                },
                failure: function (response, opts) {
                    console.log(response.responseText);
                }
            });
        }
    },
    loadAttendee: function (ID) {
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
        var index = rol.Main.app.attendeeListStore.find('ID', ID);
        var attendee = rol.Main.app.attendeeListStore.getAt(index);

        rol.Main.app.attendeeDetails.eventId = attendee.get('EventID');
        Ext.getCmp('aDetailsTab').update(attendee.data);
        //load the attendee's agenda
        rol.Main.app.attendeeDetails.Agenda();
        Ext.getBody().unmask();
    },
    loadEventAgenda: function (eventID) {
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
        $.ajax({
            url: rol.Main.BaseServicesURL + '/GetAgendaItems',
            dataType: 'jsonp',
            data: {
                'eventID': JSON.stringify(eventID),
                'orderBy': JSON.stringify(''),
                'APIToken': rol.Main.APIToken,
                'Mobile-Request': 'true'
            },
            method: 'GET',
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;

                Ext.data.ProxyMgr.registerType('memory', Ext.data.MemoryProxy);
                rol.Main.app.agendaListStore = new Ext.data.ArrayStore({
                    model: 'CoreAgendaList',
                    sorters: 'StartDate',
                    getGroupString: function (record) {
                        return rol.Main.FormatDate(record.get('StartDate'));
                    }
                });

                rol.Main.app.agendaListStore.loadData(jsonData);
                rol.Main.app.agenda.Bind(rol.Main.app.agendaListStore);
            },
            failure: function (response, opts) {
                console.log(response.responseText);
            }
        });
    },
    checkinAttendees: function (attendees) {
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
        $.ajax({
            url: rol.Main.BaseServicesURL + '/CheckinRegistrationsForEvent',
            dataType: 'jsonp',
            data: {
                'registrationIDs': JSON.stringify(attendees),
                'APIToken': rol.Main.APIToken,
                'Mobile-Request': 'true'
            },
            method: 'GET',
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;
                rol.Main.app.attendeeList.UpdateCheckinStatus(attendees, true);
            },
            failure: function (response, opts) {
                rol.Main.app.attendeeList.UpdateCheckinStatus(attendees, false);
            }
        });
    },
    checkinSessionAttendees: function (attendees, cfid, eventid) {
        //TO DO: Actually change session status in WS.
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
        $.ajax({
            url: rol.Main.BaseServicesURL + '/CheckinRegistrationsForAgendaItem',
            dataType: 'jsonp',
            data: {
                'registrationIDs': JSON.stringify(attendees),
                'cfid': JSON.stringify(cfid),
                'eventID': JSON.stringify(eventid),
                'APIToken': rol.Main.APIToken,
                'Mobile-Request': 'true'
            },
            method: 'GET',
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;
                rol.Main.app.agendaDetails.UpdateCheckinStatus(attendees, true);
            },
            failure: function (response, opts) {
                rol.Main.app.attendeeList.UpdateCheckinStatus(attendees, false);
            }
        });
    },
    loadAttendeeSchedule: function (eventID, registrationID) {
        Ext.getBody().mask('<div class="loading">Loading&hellip;</div>');
        $.ajax({
            url: rol.Main.BaseServicesURL + '/GetAgendaItemResponsesForRegistration',
            dataType: 'jsonp',
            data: {
                'eventID': JSON.stringify(eventID),
                'registrationID': JSON.stringify(registrationID),
                'orderBy': JSON.stringify(''),
                'APIToken': rol.Main.APIToken,
                'Mobile-Request': 'true'
            },
            method: 'GET',
            success: function (response, opts) {
                Ext.getBody().unmask();
                var jsonData = response.d.Data;
                var store = new Ext.data.Store({
                    model: 'CoreAgendaList',
                    getGroupString: function (record) {
                        return rol.Main.FormatDate(record.get('StartDate'));
                    },
                    data: jsonData
                });
                Ext.getCmp('aScheduleTab').Bind(store);
            },
            failure: function (response, opts) {
                console.log(response.responseText);
            }
        });
    }
};

/***********Data************/

// Helpers
function getAttendeeURL(cfid) {
    if (cfid == 0) {
        return rol.Main.BaseServicesURL + '/GetRegistrationsForEvent';
    }
    else {
        return rol.Main.BaseServicesURL + '/GetRegistrationsForCustomField';
    }    
}