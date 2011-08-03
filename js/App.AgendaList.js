/***********Agenda************/

rol.EventSchedule = Ext.extend(Ext.Panel, {
    title: 'Event Schedule',
    id: '_eventschedulePanel',
    layout: 'fit',
    Load: function() {
        rol.Main.app.loadCard(this, null);
        data.Access.loadEventAgenda(rol.Main.EventID);
    },
    initComponent: function() {
        this.list = new Ext.List({
            id: '_eventschedule',
            cls: 'eventschedule',
            itemTpl: [
                                '<tpl for=".">',
                                    '<div class="agendaItem">',
                                        '<h4>{FormattedName}</h4>',
                                        '<ul>',
                                            '<li>{[rol.Main.FormatTime(values.StartDate)]}',
                                                '<tpl if="values.EndDate != \'\'">',
                                                    ' - ',
                                                '</tpl>', 
                                            '{[rol.Main.FormatTime(values.EndDate)]}</li>',
                                            '<li>{Location}</li>',
                                        '</ul>',
                                     '</div>',
                                '</tpl>'
                            ],
            fullscreen: true,
            scroll: 'vertical',
            grouped: true,
            singleSelect: true,
            emptyText: '<div class="empty">No records to display</div>',
            itemSelector: '.agendaItem',
            store: new Ext.data.Store({
                model: 'CoreAgendaList'
            })
        });
        this.list.on('itemtap', this.onAgendaSelect, this);
        this.items = [this.list].concat(this.items || []);

        rol.EventSchedule.superclass.initComponent.call(this);
    },
    onAgendaSelect: function(dv, i, item, e) {
        var ds = dv.getStore();
        var r = ds.getAt(i);
        rol.Main.app.agendaDetails.Load(r.get('ID'));
    },
    Bind: function(store) {
        var count = store.getCount();
        this.list.bindStore(store);
    }
});
/***********Agenda************/