//                      ______________
//                 .-:=[ XBOX Manager ]=:-.
//
// Install/Uninstall games over FTP to xbox
//
// Read the comments throughout this file for more information
//
// - sairuk

var xboxmanager = "/opt/xboxmanager/scripts/xboxmanager.sh";
var xboxconfig = "/opt/xboxmanager/xboxmanager.cfg";
let rn_settings = new Object();
var last_state = 1; // 1: disconnected, 0: connected

// update log window
function _log(output) {
    document.getElementById("log-area").innerText = output;
}

function loading(id) {
    document.getElementById(id).innerHTML = "";
    document.getElementById(id).innerHTML = '<img src="assets/loading.gif" class="loading"></img>';
}


// installers
function install_options(mode="list-available", xiso=false) {

    var cmd_os = [
        xboxmanager,
        "-u", rn_settings['xbox_username'],
        "-p", rn_settings['xbox_password'],
        "-i", rn_settings['xbox_ipaddress'],
        "-f", rn_settings['xbox_games_drive'],
        "-t", rn_settings['xbox_games_directory'],
        "-l", rn_settings['local_mount_directory'],
        "-a", rn_settings['local_games_directory'],
        "-m", mode
    ];

    //console.log(cmd_os)
    return(cmd_os);

};

// generic function to get mode data
function rn_method(id, mode) {
    console.log(mode+"_xbox");

    var target = document.getElementById(id).parentNode.firstElementChild.innerText;
    var cmd_os = install_options(mode).concat(['-x',target]);

    target_id = target.replace(/[_\s]+/g, '-');

    var target_elem = mode+"-"+target_id;

    var current = document.getElementById(target_elem).innerHTML;
    loading(target_elem);

    cockpit.spawn(cmd_os, {"err": "out"

    }).done(function(data) {
        returned = new String(data);
        _log(returned);
        list_installed();
        document.getElementById(target_elem).innerHTML = current;

    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
        document.getElementById(target_elem).innerHTML = current;
    });

}

// generic function for returning lists
function rn_get_lists(mode, text) {

    const method_list = document.getElementById('rn-'+mode+'-list');
    method_list.replaceChildren();

    var cmd_os = install_options(mode);

    cockpit.spawn(cmd_os, {"err": "out"

    }).done(function(data) {
        returned = new String(data);
        _log(returned);

        var items = returned.split('\n');
        items.forEach(item=>{

            if ( item !== "" ) {

                element_name = item.replace(/[_\s]+/g, '-');

                const method_li = document.createElement('li');
                const method_div = document.createElement('div');
                const method_span = document.createElement('span');
                const method_button = document.createElement('button');

                method_list.appendChild(method_li);
                method_li.appendChild(method_div);
                method_span.innerText = item;
                method_div.appendChild(method_span);
                method_div.appendChild(method_button);

                
                mode_button=element_name;
                method_button.innerText = text;

                if ( mode == "list-available" )
                {
                    mode_button = "install";
                    method_button.classList = "rn-install";
                    method_button.id = ("install-"+element_name);
                    method_button.addEventListener("click", install_xbox);
                } else if ( mode == "list-installed" ) {
                    mode_button = "uninstall";
                    method_button.addEventListener("click", uninstall_xbox);

                    // add a backup button
                    const backup_button = document.createElement('button');
                    method_div.appendChild(backup_button);
                    backup_button.id = "backup-"+element_name;
                    backup_button.classList = "rn-manager";
                    backup_button.innerText = "Backup";
                    backup_button.addEventListener("click", backup_xbox);
                }

                method_button.classList = "rn-"+mode_button;
                method_button.id = (mode_button+"-"+element_name);
            }
        })
    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
    });

}

// list-available
function list_available() { rn_get_lists('list-available', "Install"); }

// list-installed
function list_installed() { rn_get_lists("list-installed", "Uninstall"); }

// install
function install_xbox() { rn_method(this.id, 'install'); }

// uninstall
function uninstall_xbox() { rn_method(this.id, 'uninstall'); }

// backup
function backup_xbox() { rn_method(this.id, 'backup'); }

function check_status() {
    mode = "status";

    var cmd_os = install_options(mode);

    cockpit.spawn(cmd_os, {"err": "out"

    }).done(function(data) {
        returned = new String(data);
        _log(returned);
        document.getElementById(mode).style.backgroundColor = '#497c50';
        document.getElementById(mode).title = 'Connected';
        if ( last_state == 1 )
        {
            last_state = 0;
            list_installed();
        }
    }).fail(function(error){
        returned = new String(error);
        console.log(error);
        _log(returned);
        document.getElementById(mode).style.backgroundColor = 'rgb(228, 37, 37)';
        document.getElementById(mode).title = 'Disconnected';
        last_state = 1;
    });

}

// read in the ansible config convert from ansible object to javascript object
// this is used
function read_ansible_cfg() {

    file = cockpit.file(xboxconfig,
    { syntax: JSON,
        binary: false,
        max_read_size: 512,
        superuser: 'false'
    }).read()
   .then((content, tag) => { 
        //rn_settings = yaml_to_js(content);
        rn_settings = content;
        update_input_from_cfg();
        list_available();
        list_installed();
    })
    .catch(error => {
        console.log(error);
        var msg = "Failed to read config file";
        alert(msg);
        _log(msg)
    });    
}

// write a javascript object to ansible format
// this is handled in the called scripts for now
function write_ansible_cfg() {

    // update all settings from inputs

    update_cfg_from_input()

    cockpit.file(xboxconfig,
        { syntax: JSON,
            binary: false,
            max_read_size: 512,
            superuser: false
        }).replace(rn_settings)
       .then((content, tag) => {
            read_ansible_cfg();
        })
        .catch(error => {
            console.log(error);
            var msg = "Failed to read config file";
            alert(msg);
            _log(msg)
        });
}

function update_input_from_cfg() {

    document.getElementById('s-user-name-input').value = rn_settings['xbox_username'];
    document.getElementById('s-update-passwd-input').value = rn_settings['xbox_password'];

    document.getElementById('s-ip-address-input').value = rn_settings['xbox_ipaddress'];
    document.getElementById('s-set-xbox-install-type-input').value = rn_settings['xbox_type'];

    document.getElementById('s-set-xbox-install-drive-input').value = rn_settings['xbox_games_drive'];
    document.getElementById('s-set-xbox-install-dir-input').value = rn_settings['xbox_games_directory'];
    document.getElementById('s-set-local-install-dir-input').value = rn_settings['local_games_directory'];
    document.getElementById('s-set-local-mount-dir-input').value = rn_settings['local_mount_directory'];
}

function update_cfg_from_input() {

    rn_settings['xbox_username'] = document.getElementById('s-user-name-input').value;
    rn_settings['xbox_password'] = document.getElementById('s-update-passwd-input').value;

    rn_settings['xbox_ipaddress'] = document.getElementById('s-ip-address-input').value;
    rn_settings['xbox_type'] = document.getElementById('s-set-xbox-install-type-input').value;

    rn_settings['xbox_games_drive'] = document.getElementById('s-set-xbox-install-drive-input').value;
    rn_settings['xbox_games_directory'] = document.getElementById('s-set-xbox-install-dir-input').value;
    rn_settings['local_games_directory'] = document.getElementById('s-set-local-install-dir-input').value;
    rn_settings['local_mount_directory'] = document.getElementById('s-set-local-mount-dir-input').value;
}

// page switcher, now you see it, now you don't
function show_page() {

    // this is ugly but meh
    const pages = Array.from(document.getElementsByClassName('rn-page-container'));

    pages.forEach(page=>{
        // hide em all first again
        page.classList.replace("rn-show","rn-hidden")
    })

    // show what we clicked on
    document.getElementById(this.id + "-page").classList.replace("rn-hidden","rn-show")

}

// waiting until we're loaded up so the elements we need are available
window.onload = function() {

    // group the elements we require to work with
    // we do this by class because it was easier
    const menuitems = Array.from(document.getElementsByClassName('rn-menu-item'));
    const updaters = Array.from(document.getElementsByClassName('rn-value-updater'));

    // menu items (rn-menu-item)
    menuitems.forEach(menuitem=>{
        menuitem.addEventListener("click", show_page);
    })

    // this is out poll timer
    var pollDevice = setInterval(()=>{
        check_status();
    },5000);

    document.getElementById('x-update').addEventListener("click", write_ansible_cfg);
    
    read_ansible_cfg();

}

// nfi what this does, remove it and see what breaks at some point
//cockpit.transport.wait(function() { })