var cacheManager = null;
var CACHE_INIT = false;

function Cache_init()
{
    if (CACHE_INIT)
        return;
    CACHE_INIT = true;
    cacheManager = Cache_new();
}

function Cache_new()
{
    return this;
}

function Cache_load(url)
{
    result = $.ajax("popup-template", {
        async: false,
        dataType: "html"
    });
    return result;
}
