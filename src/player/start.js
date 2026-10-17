/* Local bootstrap only. Never downloads/decrypts/evaluates remote JavaScript. */
window.XplayerBootstrap.start().catch(function(error){
    document.querySelector('.Loading').hidden=true;
    const target=document.getElementById('error');target.textContent=error.message;target.hidden=false;
});
