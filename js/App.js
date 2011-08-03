Ext.ns('rol', 'data');

/****Models****/

Ext.regModel('EventList', {
    fields: ['ID', 'Title', 'StartDate','DateGroup']
});
Ext.regModel('AttendeeList', {
    fields: ['ID', 'FirstName', 'LastName', 'Company', 'City','State','Country', 'Email', 'StatusDescription']
});
Ext.regModel('CoreAgendaList', {
    fields: ['ID', 'NameOnForm', 'StartDate', 'EndDate', 'Location', 'CustomField.StartDate']
});
Ext.regModel('ResponseList', {
    fields: ['ID', 'Response', 'AttendeeStatus.Name', 'CustomField.StartDate']
});

/****Models****/

/***********Init************/

rol.Main = {
    SessionID: '',
    BaseServicesURL: 'https://www.regonline.com/api/default.asmx',
    EventID: null,
    EventTitle: '',
    attendeeListStore: null,
    agendaListStore: null,
    agendaResponseStore: null,
    fullscreen: true,
    CFID: null,
    app: null,
    agendaResponses: null,
    DateFormat: 'l, F d, Y',
    TimeFormat: 'g:i A',
    FormatDate: function(d) {
        return (d != null && d.length > 0) ? Date.parseDate(d, "M$").format(this.DateFormat) : " ";
    },
    FormatTime: function(d) {
        return (d != null && d.length > 0) ? Date.parseDate(d, "M$").format(this.TimeFormat) : " ";
    },
    ShowCheckinBox: function(status) {
        return (status.toLowerCase() == "attended" ? "off" : "on");
    },
    GetStatusDescription: function(status) {
        return status == null ? "N/A" : status.Name;
    },
    getStatusColor: function(status) {
        var hex = 'F89828';
        var aColor = {
            'attended': '6DB33F',
            'confirmed': 'FFC425',
            'pending': '669BCC',
            'no-show': 'C02821',
            'canceled': 'FF0000',
            'n/a': 'B2B7BB',
            'standby': 'B3D88B',
            'follow-up': 'B4D6F1',
            'declined': 'FED28B',
            'approved': '076324'
        }
        if (aColor[status]) {// != null){
            hex = aColor[status];
        }
        return hex;
    },
    getQuerystring: function(key, default_) {
        if (default_ == null) default_ = "";
        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        var qs = regex.exec(window.location.href);
        if (qs == null)
            return default_;
        else
            return qs[1];
    },
    loadStatChart: function(el, card) {
        //check for tag to replace
        if (Ext.getDom(el)) {
            if (rol.Main.app.getActiveItem() == card && rol.Main.currentEvent.TotalRegistrations != 0) {
                console.log('loading chart to ' + el);
                var aStore;
                var chartTitle;
                if (el == "evtChart") {
                    aStore = rol.Main.app.attendeeList.list.getStore();
                    chartTitle = "Registration Statuses";
                }
                else {
                    aStore = rol.Main.app.agendaResponseStore;
                    chartTitle = "Item Statuses";
                }

                var aGroups = aStore.getGroups();
                var chdl = '';
                var chd = '';
                var chl = '';
                var chco = '';
                for (i = 0; i < aGroups.length; i++) {
                    var name = aGroups[i].name == null ? 'N/A' : aGroups[i].name;
                    chdl += name;
                    var size = aGroups[i].children.length;
                    chl += size;
                    chd += size;
                    chco += rol.Main.getStatusColor(name.toLowerCase());
                    if (i < (aGroups.length - 1)) {
                        chdl += '|';
                        chl += '|';
                        chd += ',';
                        chco += ',';
                    }
                }
                var imgPath = '<img src="http://chart.apis.google.com/chart?chf=bg,s,F2F3F3&chs=280x190&cht=p&chd=t:' + chd + '&chdl=' + chdl + '&chl=' + chl + '&chco=' + chco + '&chtt=' + chartTitle + '" width="280" height="190" alt="Registration Statuses" />';
                Ext.getDom(el).innerHTML = imgPath;
            }
        }
    },

    loadEventChart: function() {
        this.loadStatChart('evtChart', rol.Main.app.eventDetails);
    },
    loadSessionChart: function() {
        this.loadStatChart('sessionChart', rol.Main.app.agendaDetails);
    },
    rand: function(n) {
        return (Math.floor(Math.random() * n + 1));
    },

    init: function() {
        this.app = new rol.App({
            title: ''
        });
    },
    setCookie: function(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    deleteCookie: function(name) {
        document.cookie = name + "=" + ";expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/"
    },
    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    clearCookie: function(name) {
        this.setCookie(name, "", -1);
    }
}
Ext.setup({
    phoneStartupScreen: '../phone_startup.png',
    icon: '../icon.png',
    glossOnIcon: true,
    onReady: function() {
        rol.Main.init();
        rol.Main.app.backButton.hide();
        rol.Main.app.logoutButton.hide();
        
        //check stored token
        if (rol.Main.readCookie('token')) {
            if (rol.Main.readCookie('un')) {
                rol.Main.APIToken = rol.Main.readCookie('token');
                rol.Main.UserName = rol.Main.readCookie('un');
                console.log('reloading session for: ' + rol.Main.UserName + ':' + rol.Main.APIToken);

                //look for pass action, eg; response from scanner
                var action;
                if (rol.Main.getQuerystring('a') != '') {
                    action = rol.Main.getQuerystring('a');
                    //get eventID
                    if (rol.Main.getQuerystring('eventid') != '') {
                        rol.Main.EventID = rol.Main.getQuerystring('eventid');
                        data.Access.loadEventStats(rol.Main.EventID);
                        console.log('performing action: ' + action);
                        switch (action) {
                            case 'scanattendee':
                                if (rol.Main.getQuerystring('code') != '') {
                                    var id = rol.Main.getQuerystring('code');
                                    this.isBack = false;
                                    var cfid = 0;
                                    rol.Main.app.cardHistory.push(rol.Main.app.eventList.id);
                                    rol.Main.app.cardHistory.push(rol.Main.app.eventDetails.id);
                                    if (rol.Main.getQuerystring('cfid') != '') {
                                        cfid = rol.Main.getQuerystring('cfid');
                                        rol.Main.app.agendaDetails.cfid = cfid;
                                    }
                                    rol.Main.app.attendeeList.Load( cfid, 'rol.Main.app.attendeeList.Checkin("' + id + '", "' + cfid + '")');
                                }
                                break;
                        }
                    }
                }
                if (!action) {
                    rol.Main.app.eventList.Load();
                }
            }
        }
    }
});
/***********Init************/

/***********App************/
rol.App = Ext.extend(Ext.Panel, {
    fullscreen: true,
    title: this.title,
    layout: 'card',
    id: '_app',
    onOrientationChange: function() {
        rol.Main.app.currentCard.doComponentLayout();
        rol.Main.app.currentCard.hide();
        rol.Main.app.currentCard.show();

        /* rol.Main.app.currentCard.doComponentLayout();
        if (rol.Main.app.currentCard.dockedItems.items.length > 0) {
        rol.Main.app.currentCard.dockedItems.items[0].hide();
        rol.Main.app.currentCard.dockedItems.items[0].show();
        }*/
    },
    activeItem: 0,
    initComponent: function() {
        //Main toolbar
        this.backButton = new Ext.Button({
            text: 'Back',
            cls: 'btn',
            handler: this.onBackButtonTap
        });
        this.logoutButton = new Ext.Button({
            text: 'Logout',
            cls: 'btn',
            handler: this.onLogoutButtonTap
        });
        this.toolBar = new Ext.Toolbar({
            xtype: 'toolbar',
            cls: 'toolBar',
            dock: 'top',
            layout: {
                pack: 'left'
            },
            defaults: {
                scope: this
            },
            title: this.title,
            items: [this.backButton, { xtype: 'spacer' }, this.logoutButton]//, { flex: 1, ui: 'mask' }]
        });
        this.dockedItems = this.dockedItems || [];
        this.dockedItems.unshift(this.toolBar);

        //create panels
        this.login = new rol.Login({});
        this.eventList = new rol.EventList({});
        this.eventDetails = new rol.EventDetails({});
        this.attendeeList = new rol.AttendeeList({});
        this.attendeeDetails = new rol.attendeeDetails({});
        this.agenda = new rol.EventSchedule({});
        this.agendaDetails = new rol.AgendaDetails({});
        this.searchBar = new rol.SearchBar({});
        //load panels
        this.items = [this.login, this.eventList, this.eventDetails, this.attendeeList, this.attendeeDetails, this.agenda, this.agendaDetails, this.searchBar];

        rol.App.superclass.initComponent.call(this);

    },

    cardHistory: [],
    backCard: null,
    isBack: true,
    currentCard: null,
    //events
    onBackButtonTap: function() {
        if (this.cardHistory.length > 0) {
            var cardID = this.cardHistory.pop();
            var card = Ext.getCmp(cardID);
            this.backCard = card;
            //}
            if (this.backCard != null) {
                // Clear any search criteria
                rol.Main.app.attendeeList.CancelSearch();
                Ext.getCmp('attendeeListSearch_fld').setValue('');
                Ext.getCmp('attendeeListSearch').hide('fade');

                this.isBack = true;
                this.backCard.Load();
            }
        }
    },
    onLogoutButtonTap: function() {
        if (confirm('Are you sure you want to log out?')) {
            rol.Main.deleteCookie('un');
            rol.Main.deleteCookie('token');
            rol.Main.app.login.Load();
        }
    },
    onError: function(message, okHandler) {
        var fn = (okHandler != null) ? okHandler : Ext.emptyFn;
        Ext.Msg.alert('Notice', message, fn);
    },
    //TO DO: remove bkCard
    loadCard: function(card, title) {
        //set history
        if ((!this.isBack) && (rol.Main.app.getActiveItem() != null) && rol.Main.app.getActiveItem().id != '_loginPanel') {
            console.log('adding card ' + rol.Main.app.getActiveItem().id);
            this.cardHistory.push(rol.Main.app.getActiveItem().id);
        }
        this.isBack = false;

        var slideDir = (card == this.backCard) ? 'right' : 'left';
        this.setActiveItem(card, { type: 'slide', direction: slideDir });
        this.setTitle(title);
        this.currentCard = card;

        this.logoutButton.show();

        if (this.cardHistory.length > 0) {
            this.backButton.show();
        } else {
            this.backButton.hide();
        }
    },
    setTitle: function(title) {
        this.toolBar.setTitle(title != null ? title : rol.Main.app.EventTitle);
    }
});
    /***********App************/


/***********Search Bar************/

rol.SearchBar = Ext.extend(Ext.Toolbar, {
    dock: 'bottom',
    id: '_searchbar',
    cls: 'toolBar',
    layout: {
        pack: 'center'
    },
    TypeHandler: null,
    lbl: 'Search',
    initComponent: function() {
        this.field = new Ext.form.Text({
            //used to field search value in component search function
            id: this.id + '_fld',
            cls: 'srchfld'
        });
        this.cancelBtn = new Ext.Button({
            text: 'Cancel',
            cls: 'btn'
        });
        //set search handler
        if (this.TypeHandler != null) {
            this.field.on('keyup', this.TypeHandler, this);
        }
        //set cancel handler
        this.cancelBtn.setHandler(function() {
            Ext.getCmp('eventListSearch_fld').setValue('');
            Ext.getCmp('attendeeListSearch_fld').setValue('');
            rol.Main.app.eventList.CancelSearch();
            rol.Main.app.attendeeList.CancelSearch();
            Ext.getCmp(this.id).hide('fade');
        }, this);
        //add search bar
        this.items = [this.field, this.cancelBtn];
        rol.SearchBar.superclass.initComponent.call(this);
    }
});

/***********Search Bar************/

// Hides the app tooltip for iPhones
function hideAppTip() {
    if (rol.Main.app.login.installBubble) {
        rol.Main.app.login.installBubble.hide();
    }
}