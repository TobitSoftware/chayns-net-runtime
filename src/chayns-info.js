import logger from 'chayns-logger';
import ConsoleLogger from './utils/console-logger';
import { decodeTobitAccessToken } from './utils/convert';
import { getUrlParameters } from './utils/helper';
import { getTobitAccessToken } from './json-native-calls/calls/index';
import Request from './utils/request';

import LOGIN_TAPP from './constants/login-tapp';
import { DEFAULT_LOCATIONID } from './constants/defaults';
import VERSION from './constants/version';

const consoleLoggerLocation = new ConsoleLogger('loadLocation(chayns-info.js)');
const consoleLoggerTapps = new ConsoleLogger('loadTapps(chayns-info.js)');
const consoleLoggerUserData = new ConsoleLogger('updateUserData(chayns-info.js)');

export let chaynsInfo;
let globalData;

export async function loadLocation(locationId = DEFAULT_LOCATIONID) {
    try {
        const locationSettingsRequest = await Request.get(`https://chaynssvc.tobit.com/v0.5/${locationId}/LocationSettings`);

        if (locationSettingsRequest.status === 204) {
            consoleLoggerLocation.warn('no location found');
            logger.warning({
                message: 'No location found.',
                fileName: 'chaynsInfo.js',
                section: 'loadLocation',
                locationId
            });
            return false;
        }

        const locationSettingsRequestResponse = await locationSettingsRequest.json();
        const locationSettings = await locationSettingsRequestResponse.data;


        locationSettings.design.color = `#${locationSettings.design.color}`;

        chaynsInfo = {
            Version: VERSION,
            BaseUrl: '/',
            LocationID: locationId,
            SiteID: locationSettings.siteId,
            LocationName: locationSettings.locationName,
            IsMobile: false,
            ExclusiveMode: false,
            IsFacebook: (document.referrer.indexOf('staticxx.facebook') > -1 || location.href.indexOf('fb=1') > -1),
            Tapps: [],
            LocationPersonID: locationSettings.locationPersonId,
            Domain: window.location.host,
            ColorMode: getUrlParameters().colormode || locationSettings.design.colorMode,
            Color: getUrlParameters().color || locationSettings.design.color,
            Webshadow: {
                MenuPosition: 0
            },
            getGlobalData: () => globalData
        };


        globalData = {
            Device: {},
            AppInfo: {
                Version: parseInt(VERSION) || 2,
                domain: location.host,
                Tapps: [],
                TappSelected: {},
                FacebookAppID: locationSettings.facebookAppId,
                FacebookPageID: locationSettings.facebookId,
                Title: chaynsInfo.LocationName,
                CurrentUrl: window.location.href,
                SiteID: chaynsInfo.SiteID,
                LocationID: chaynsInfo.LocationID,
                IsColorSchemeDark: false,
                colorMode: chaynsInfo.ColorMode,
                color: chaynsInfo.Color,
            }
        };

        await updateUserData();

        window.chaynsInfo = chaynsInfo;
        return true;
    } catch (e) {
        logger.error({
            message: 'Load location failed.',
            locationId,
            fileName: 'chaynsInfo.js',
            section: 'loadLocation',
            ex: {
                message: e.message,
                stackTrace: e.stack
            }
        });
        consoleLoggerLocation.error('Load location failed.', e);
        return false;
    }
}

export async function updateUserData() {
    try {
        const getTobitAccessTokenRes = await getTobitAccessToken();
        const accessToken = getTobitAccessTokenRes.data.tobitAccessToken;

        const payload = decodeTobitAccessToken(accessToken);

        chaynsInfo.User = {
            ID: payload && payload.TobitUserID ? payload.TobitUserID : 0,
            FirstName: payload && payload.FirstName ? payload.FirstName : '',
            LastName: payload && payload.LastName ? payload.LastName : '',
            PersonID: payload && payload.PersonID ? payload.PersonID : '',
            TobitAccessToken: accessToken,
            UACGroups: []
        };

        globalData.AppUser = {
            UACGroups: [],
            FacebookAccessToken: '',
            FacebookUserName: payload && payload.FirstName && payload.LastName ? `${payload.FirstName} ${payload.LastName}` : '',
            FacebookID: payload && payload.FacebookUserID ? payload.FacebookUserID : '',
            PersonID: payload && payload.PersonID ? payload.PersonID : '',
            TobitUserID: payload && payload.TobitUserID ? payload.TobitUserID : 0,
            TobitAccessToken: accessToken,
            AdminMode: false
        };
        return true;
    } catch (e) {
        logger.error({
            ex: {
                message: e.message,
                stackTrace: e.stack
            }
        });
        consoleLoggerUserData.error('Update userData failed.', e);

        return false;
    }
}

export async function loadTapps(locationId) {
    try {
        const request = await Request.get(`https://chaynssvc.tobit.com/v0.5/${chaynsInfo.LocationID}/Tapp?forWeb=true`);

        if (request.status === 204) {
            consoleLoggerTapps.warn('Location has no tapps');
            logger.warning({
                message: 'Location has no tapps. (CustomNumber:Status)',
                locationId,
                customNumber: request.status,
                fileName: 'chaynsInfo.js',
                section: 'loadTapps',
            });
        } else if (request.status !== 200) {
            consoleLoggerTapps.warn('Get locationTapps failed.', request.status);
            logger.error({
                message: 'Get locationTapps failed. (CustomNumber:Status)',
                locationId,
                customNumber: request.status,
                fileName: 'chaynsInfo.js',
                section: 'loadTapps',
            });
        }

        const jsonResponse = await request.json();
        const data = jsonResponse.data || [];

        const getTappList = list => list.reduce((tapps, entry) => {
            // the type is a binary value, the bit for a tapp is 1
            if ((entry.type & 1) === 1) {
                tapps.push(entry);
            } else {
                tapps.push(...getTappList(entry.tapps));
            }
            return tapps;
        }, []);

        const tapps = getTappList(data);

        tapps.push(LOGIN_TAPP);

        chaynsInfo.Tapps = tapps;
        globalData.AppInfo.Tapps = chaynsInfo.Tapps;
    } catch (e) {
        logger.error({
            message: 'Load Tapps failed.',
            locationId,
            fileName: 'chaynsInfo.js',
            section: 'loadTapps',
            ex: {
                message: e.message,
                stackTrace: e.stack
            }
        });
        consoleLoggerTapps.error('Load Tapps failed.', e);

        chaynsInfo.Tapps = [LOGIN_TAPP];
        globalData.AppInfo.Tapps = chaynsInfo.Tapps;
    }
}

export function setSelectedTapp(tapp) {
    if (tapp && typeof tapp === 'object') {
        chaynsInfo.ExclusiveMode = tapp.exclusiveView || false;
        globalData.AppInfo.TappSelected = {
            Id: tapp.id,
            InternalName: tapp.internalName,
            ShowName: tapp.showName,
            SortID: tapp.sortId,
            ExclusiveMode: tapp.exclusiveView,
            LoadAsAjax: tapp.loadAsAjax,
            Url: tapp.url,
            Link: tapp.link,
            SendAuthenticationHeader: tapp.sendAuthenticationHeader,
            PostTobitAccessToken: tapp.postTobitAccessToken,
            UserGroupIds: tapp.uacGroupIds || [],
            HideFromMenu: tapp.hideFromMenu,
            Mobile: tapp.mobile,
            Desktop: tapp.desktop,
            ShowOnlyInAdminMode: tapp.showOnlyInAdminMode,
            Icon: tapp.icon,
            FallbackTapp: tapp.fallbackTapp,
            isExclusiveView: tapp.isExclusiveView
        };
    }
}
