import {getRelativeColor, decodeTobitAccessToken} from '../shared/utils/convert';

document.parentWindow = {
    external: {
        PutKeyValue: (name, value) => {
            localStorage.setItem(name, value);
        },
        GetKeyValue: (name) => {
            return localStorage.getItem(name);
        }
    }
};
let accessToken = document.parentWindow.external.GetKeyValue("TobitAccessToken");
let payload = decodeTobitAccessToken(accessToken);

const ChaynsInfo = {
    Version: '4014',
    BaseUrl: '/',
    User: {
        ID: payload && payload.TobitUserID ? payload.TobitUserID : 0,
        FirstName: payload && payload.FirstName ? payload.FirstName : '',
        LastName: payload && payload.LastName ? payload.LastName : '',
        PersonID: payload && payload.PersonID ? payload.PersonID : '',
        TobitAccessToken: accessToken,
        UACGroups: []
    },
    LocationID: 77783,
    SiteID: '67758-09144',
    SiteIDInUrlRequired: true,
    PageID: '336898073182458',
    LocationName: 'David by Tobit.Software',
    IsMobile: false,
    ShowAppView: false,
    LoginEnabled: true,
    IsFacebook: (document.referrer.indexOf('staticxx.facebook') > -1 || location.href.indexOf('fb=1') > -1),
    ColorScheme: {
        Name: 'Stone',
        ID: 0,
        BaseColor: '#6E6E6E',
        IsSoft: false
    },
    Tapps: [],
    AdminMode: false,
    LocationPersonID: '141-24297',
    ExclusiveMode: false,
    IsProLicense: false,
    HideTitelImage: false,
    ImprintInfoShown: false,
    Domain: window.location.host,
    ColorMode: 0,
    Color: '#6E6E6E',
    Webshadow: {
        MenuPosition: 0
    },
    getGlobalData
};

function getGlobalData() {
    return {
        AppUser: {
            UACGroups: [],
            FacebookAccessToken: '',
            FacebookUserName: payload && payload.FirstName && payload.LastName ? `${payload.FirstName} ${payload.LastName}`:'',
            FacebookID: payload && payload.FacebookUserID ? payload.FacebookUserID : '',
            PersonID: payload && payload.PersonID ? payload.PersonID : '',
            TobitUserID: payload && payload.TobitUserID ? payload.TobitUserID : 0,
            TobitAccessToken: accessToken,
            AdminMode: false
        },
        Device: {},
        AppInfo: {
            Version: 4014,
            domain: location.host,
            Tapps: [],
            TappSelected: {},
            FacebookAppID: '1507743286201238',
            FacebookPageID: '336898073182458',
            Title: 'ChaynsID',
            CurrentUrl: window.location.href,
            SiteID: '67758-09144',
            LocationID: 77783,
            IsColorSchemeDark: false,
            ColorScheme: 1,
            colorMode: 0,
            color: '#6E6E6E',
            SchemeColors: {
                C10: getRelativeColor(10),
                C20: getRelativeColor(20),
                C30: getRelativeColor(30),
                C80: getRelativeColor(80),
                C100: '#6E6E6E',
                Menu: getRelativeColor(10)
            },
            ChaynsProLicense: false,
            IsFacebookFrame: false
        }
    };
}

export default ChaynsInfo;