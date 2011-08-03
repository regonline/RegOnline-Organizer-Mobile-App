/***********Attendee List************/
rol.AttendeeList = Ext.extend(Ext.Panel, {
    title: 'Attendees',
    id: '_attendeeListPanel',
    layout: 'fit',
    EventID: null,
    cfid: null,
    CallBackFn: null,
    dockedItems: [
                {//actions
                    xtype: 'toolbar',
                    dock: 'bottom',
                    cls: 'footerBar',
                    id: '_attendeeFooterBar',
                    layout: {
                        pack: 'center'
                    },
                    items: [
                    //TO DO: Add refresh option to re-pull data from WS
                      {//search
                      stretch: false,
                      icon: 'img/searchIcon.png?v=1',
                      text: 'Search',
                      id: '_attendeeSearchBtn',
                      ui: 'plain',
                      handler: function() {
                          rol.Main.app.attendeeList.showSearch()
                      }
                  },
                         {
                             //scan
                             ui: 'plain',
                             stretch: false,
                             icon: 'img/scanIcon.png',
                             hidden: (!Ext.is.Android),
                             text: 'Scan',
                             id: '_attendeeScanBtn',
                             handler: function() {
                                 var e = document.createEvent('MouseEvents');
                                 e.initEvent('click', true, true);
                                 var a = document.createElement('a');
                                 var c = this.cfid == null ? 0 : this.cfid;
                                 var href = 'http://zxing.appspot.com/scan?ret=' + escape(window.location.protocol + '//' + window.location.host + window.location.pathname + '?a=scanattendee&eventid=' + rol.Main.EventID + '&cfid=' + c + '&code={CODE}');
                                 if (Ext.is.iPhone) {
                                     //href = 'pic2shop://scan?callback=' + escape(window.location.protocol + '//' + window.location.host + window.location.pathname + '?a=scanattendee&eventid=' + rol.Main.EventID + '&cfid=' + c + '&code=EAN');
                                     href = 'javascript:OpenScanner();';
                                 }
                                 a.setAttribute('href', href);
                                 a.dispatchEvent(e);

                             }
                         },
                          {
                              stretch: false,
                              cls: 'rolBtn',
                              icon: 'img/checkInIcon.png',
                              text: 'Check-In',
                              ui: 'plain',
                              id: '_attendeeCheckinBtn',
                              handler: function() {
                                  rol.Main.app.getActiveItem().CheckinRecords(rol.Main.app.attendeeList.list.getSelectedRecords());
                              }
}]
                }

         ],
    initComponent: function() {
        this.search = new rol.SearchBar({ floating: false, hidden: true, id: 'attendeeListSearch', TypeHandler: function() {
            rol.Main.app.attendeeList.Filter('attendeeListSearch');
        }
        });
        this.dockedItems = this.dockedItems.concat([this.search]);



        this.list = new Ext.List({
            cls: 'attendeeList',
            selectedItemCls: 'chkSelected',
            id: '_attendeeList',
            fullscreen: true,
            scroll: 'vertical',
            itemTpl: [
                                    '<tpl for=".">',
                                        '<div class="attendeeItem">',
                                             '<div class="attendeeData {StatusDescription}">',
                                                          '<ul class="aTarget" id="{ID}">',
                                                            '<h4>{LastName}, {FirstName}</h4>',
                                                            '<li>#{ID}</li>',
                                                            '<li><a href="mailto:{Email}">{Email}</a></li>',
                                                            '<li>{Company}</li>',
                                                            '<li>{City} {State} {Country}</li>',
                                                          '</ul>',
                                              '</div>',
                                               '<div class="chk {[rol.Main.ShowCheckinBox(values.StatusDescription)]}"></div>',
                                         '</div>',
                                    '</tpl>'
                                ],
            grouped: true,
            selModel: {
                mode: 'SIMPLE',
                allowDeselect: true
            },
            emptyText: '<div class="empty">No records to display</div>',
            itemSelector: '.chk',
            store: new Ext.data.JsonStore({
                model: 'attendeeList',
                sorters: 'LastName',
                groupDir: 'ASC',
                getGroupString: function(record) {
                    return record.get('StatusDescription');
                }
            })
        });
        this.list.on('containertap', this.onAttendeeTap, this);
        this.items = [this.list].concat(this.items || []);
        rol.AttendeeList.superclass.initComponent.call(this);
    },
    onAttendeeTap: function(dv, el) {
        if (el.getTarget().parentNode.className == 'aTarget') {
            var id = el.getTarget().parentNode.id;
            rol.Main.app.attendeeDetails.Load(id);
        }
    },
    showSearch: function() {
        this.search.show('pop');
        this.search.setWidth(this.getWidth());
    },
    CancelSearch: function() {
        this.list.store.clearFilter();
        this.list.store.sort([{ property: 'StatusDescription', direction: 'DESC' }, { property: 'LastName', direction: 'ASC'}]);
    },
    Filter: function(searchFieldId) {
        var q = Ext.getCmp(searchFieldId + '_fld').getValue().toLowerCase();
        if (this.list.store.isFiltered()) {
            this.list.store.clearFilter();
        }
        if (q.length > 0) {
            this.list.store.filterBy(function(record, id) {
                return record.get('FirstName').toLowerCase().indexOf(q) > -1 || record.get('LastName').toLowerCase().indexOf(q) > -1;
            });
            this.list.store.sort([{ property: 'StatusDescription', direction: 'DESC' }, { property: 'LastName', direction: 'ASC'}]);
        } else {
            this.list.Update(q, rol.Main.EventID);
            this.list.store.sort([{ property: 'StatusDescription', direction: 'DESC' }, { property: 'LastName', direction: 'ASC'}]);
        }
        this.list.setHeight('100%');
    },
    Load: function(_cfid, fn) {
        rol.Main.app.loadCard(this, null);
        this.cfid = _cfid || this.cfid || 0;
        this.CallBackFn = fn;
        this.Update();
    },
    Update: function() {
        console.log('loading attendees for event:' + rol.Main.EventID + ' cf:' + this.cfid);
        data.Access.loadAttendees(rol.Main.EventID, this.cfid);
        this.EventID = rol.Main.EventID;
    },
    CheckinRecords: function(records) {
        if (records.length > 0) {
            var registerIDs = '';
            for (i = 0; i < records.length; i++) {
                var id = records[i].get('ID');
                //console.log('checkin: ' + id);
                registerIDs = id + ',' + registerIDs;
                //clear selection
                rol.Main.app.attendeeList.list.deselect(records[i]);
            }
            this.Checkin(registerIDs, this.cfid);
        } else {
            rol.Main.app.onError('No Records Selected to Check-In');
        }

    },
    Checkin: function(registerIDs, _cfid) {
        this.cfid = _cfid || 0;
        var valid = true;
        var IDs = registerIDs.split(',');
        for (i = 0; i < IDs.length; i++) {
            var id = IDs[i];
            if (id.length > 5) {
                if (!this.ValidateCheckin(id)) {
                    valid = false;
                    //console.log('validation failed on id ' + id);
                    break;
                }
            }
        }
        if (valid) {
            //console.log('checkin: ' + registerIDs + ' | cfid' + this.cfid);
            if (this.cfid != 0) {
                data.Access.checkinSessionAttendees(registerIDs, this.cfid, rol.Main.EventID);
            } else {
                data.Access.checkinAttendees(registerIDs);
            }
        }
    },
    ValidateCheckin: function(id) {
        if (id.length > 5) {

            var attendee = rol.Main.app.attendeeListStore.findRecord('ID', id); // rol.Main.app.attendeeListStore.getAt(index);
            console.log(attendee);
            if (attendee == null) {
                rol.Main.app.onError('<div class="errorText fail">Attendee is not valid</div>');
                return false;
            }
            //check current status to ensure not already checked in
            var status = attendee.data.StatusDescription;  //get('StatusDescription');
            if (status.toLowerCase() == 'attended') {
                rol.Main.app.onError('<div class="errorText fail">Attendee is already Checked-in</div>');
                return false;
            }
            //console.log('validated id ' + id);
            return true;
        } else {
            return false;
        }
    },
    UpdateCheckinStatus: function(attendees, success) {
        if (success) {
            // Loop through and update the status for the attendees who were checked in
            if (rol.Main.app.attendeeListStore != null) {
                var attArr = attendees.split(',');
                for (j = 0; j < attArr.length; j++) {
                    for (i = 0; i < rol.Main.app.attendeeListStore.data.length; i++) {
                        var id = rol.Main.app.attendeeListStore.data.items[i].get('ID');
                        if (id == attArr[j]) {
                            rol.Main.app.attendeeListStore.data.items[i].set('StatusDescription', 'Attended');
                            //console.log(id + ' status changes');
                        }
                    }
                }
            }
            rol.Main.app.onError('<div class="errorText success">Successfully Checked-In Selected Attendee(s)</div>');
        } else {
            rol.Main.app.onError('<div class="errorText fail">Failed to Checkin-In Selected Attendee(s)</div>');
        }
        this.Load(this.cfid, '');
    },
    Bind: function(store) {
        var count = store.getCount();
        this.list.bindStore(store);
        if (count > 1) {
            rol.Main.loadEventChart();
        }
        if (this.CallBackFn != null) {
            eval(this.CallBackFn);
            this.CallBackFn = null;
        }
    }

});

/***********Attendee List************/

function OpenScanner()
{
    setTimeout(function()
    {
        // if pic2shop not installed yet, go to App Store
        window.location = "http://itunes.com/apps/scanlife";
    }, 25);
    // launch pic2shop and tell it to open Google Products with scan result
    window.location = "scanlife://sdk/scan?successurl=' + escape(window.location.protocol + '//' + window.location.host + window.location.pathname + '?a=scanattendee&eventid=' + rol.Main.EventID + '&cfid=' + c + '&code=EAN')";
}