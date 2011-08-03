/***********Event List************/

rol.EventList = Ext.extend(Ext.Panel, {
    title: 'Event List',
    id: '_eventListPnl',
    layout: 'fit',
    isLoaded: false,
    dockedItems: [{
        //actions
        xtype: 'toolbar',
        dock: 'bottom',
        cls: 'footerBar',
        layout: {
            pack: 'center'
        },
        items: [{
            stretch: false,
            icon: 'img/searchIcon.png?v=1',
            text: 'Search',
            ui: 'plain',
            handler: function() {
                rol.Main.app.eventList.showSearch();
            }
}]
}],
            initComponent: function() {
                this.search = new rol.SearchBar({ floating: false, hidden: true, lbl: 'Search Events', TypeHandler: function() { rol.Main.app.eventList.Filter('eventListSearch'); }, id: 'eventListSearch' });
                this.dockedItems = this.dockedItems.concat([this.search]);
                this.list = new Ext.List({
                    cls: 'eventList',
                    id: '_eventList',
                    isLoaded: false,
                    itemTpl: [
                        '<tpl for=".">',
                            '<div class="eventItem">',
                                '<strong class="eventTitle">{Title}</strong>',
                                '<div class="eventSubLine">#{ID}</div>',
                                '<div class="eventSubLine">{City} {State}</div>',
                                '<div class="eventSubLine">{[rol.Main.FormatDate(values.StartDate)]}</div>',
                            '</div>',
                         '</tpl>'
                            ],

                    grouped: true,
                    emptyText: '<div class="empty">No records to display<p>Only active events with an end date in the future are shown.</p></div>',
                    itemSelector: '.eventItem',
                    store: new Ext.data.JsonStore({
                        model: 'EventList'
                    })
                });

                this.list.on('itemtap', this.onEventSelect, this);
                this.items = [this.list].concat(this.items || []);
                rol.EventList.superclass.initComponent.call(this);
            },
            onEventSelect: function(dv, i, item, e) {
                var r = dv.getStore().getAt(i);
                var id = r.get('ID');
                rol.Main.app.eventDetails.Load(id);
            },
            showSearch: function() {
                this.search.show('fade');
                this.search.setWidth(this.getWidth());
            },
            Filter: function(searchFieldId) {
                var q = Ext.getCmp(searchFieldId + '_fld').getValue();
                if (this.list.store.isFiltered()) {
                    this.list.store.clearFilter();
                }
                if (q.length > 0) {
                    this.list.store.filter({ property: 'Title', value: q, anyMatch: true });
                    this.list.store.sort('Title', 'ASC');
                }
                this.list.setHeight('100%');
            },
            CancelSearch: function() {
                this.list.store.clearFilter();
            },
            Load: function() {
                rol.Main.app.loadCard(this, this.title);
                rol.Main.app.toolBar.show('fade');
                //if event list is loaded, don't reload
                if (!this.isLoaded) {
                    this.Update();
                    //set un/token cookie values
                    //TO DO:move this to more appropriate place
                    rol.Main.setCookie('un', rol.Main.UserName, 1);
                    rol.Main.setCookie('token', rol.Main.APIToken, 1);
                }
            },
            Update: function() {
                data.Access.loadEvents();
            },
            Bind: function(store) {
                var count = store.getCount();
                this.list.bindStore(store);
                if (count >= 1) {
                    this.isLoaded = true;
                }
            }
        });


        /***********Event List************/