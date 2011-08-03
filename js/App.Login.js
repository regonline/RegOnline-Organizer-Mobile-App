Ext.ns('rol', 'data');

/***********Login************/
rol.Login = Ext.extend(Ext.form.FormPanel, {
    cls: 'login',
    id: '_loginPanel',
    fullscreen: true,
    scroll: 'vertical',
    Load: function() {
        rol.Main.app.loadCard(this, 'Login');
        rol.Main.app.backButton.hide();
        rol.Main.app.logoutButton.hide();
    },
    items: [
        {
            xtype: 'container',
            cls: 'titleImg'
        },
        {
            xtype: 'fieldset',
            id: '_loginForm',
            defaults: {
                required: false,
                labelAlign: 'left'
            },
            items: [
                    {
                        xtype: 'textfield',
                        name: 'username',
                        label: 'Username',
                        labelWidth: '110px',
                        handleMouseEvents: true,
                        listeners: {
                            'render': function(cmp) { cmp.getEl().on('click', hideAppTip); }
                        }
                    }, {
                        xtype: 'textfield',
                        inputType: 'password',
                        name: 'password',
                        label: 'Password',
                        labelWidth: '110px'
                    }
                ]
        }, {
            xtype: 'button',
            text: 'Sign In',
            maxWidth: '100',
            cls: 'btn loginBtn',
            handler: function() {
                var form = rol.Main.app.login.getValues();
                if (form["username"] == '' || form["password"] == '') {
                    rol.Main.app.onError('Invalid Login');
                }
                else {
                    data.Access.login(form["username"], form["password"]);
                }
            }
        },
        {
            xtype: 'button',
            ui: 'plain',
            cls: 'lnklbl',
            text: 'View full site',
            handler: function() {
                document.location = "../manager/login.aspx?m=1";
            }
        },
        {
            xtype: 'container',
            cls: 'logo'
        }
        ],
    initComponent: function() {
        rol.Login.superclass.initComponent.call(this);
    }
});
/***********Login************/