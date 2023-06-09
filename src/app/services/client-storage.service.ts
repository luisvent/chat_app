import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClientStorageService {
  constructor() {
  }

  decode(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  /**
   * Returns the JWT toke for the logged user.
   */
  getToken() {
    return localStorage.getItem('jwt');
  }

  /**
   * Returns if token is valid.
   */
  isTokenValid(): boolean {
      const token = this.getToken();
      try {
        if (token) {
          const date = new Date(0);
          const decoded = this.decode(token);
          date.setUTCSeconds(decoded.exp);
          return date.valueOf() > new Date().valueOf();
        } else {
          return false;
        }
      } catch (err) {
        return false;
      }
  }


  /**
   * Returns the userId for the logged user.
   */
  getUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId? +userId : 0;
  }


  /**
   * Returns the userName for the logged user.
   */
  getUserName() {
    return localStorage.getItem('userName');
  }

  /**
   * Returns the default app for the logged user.
   */
  getDefaultApp() {
    return localStorage.getItem('defaultApp');
  }

  /**
   * Returns the startpage for the logged user.
   */
  getGuideStartPage() {
    return localStorage.getItem('guideStartPage');
  }

  gethideSmartTemplateStartPage() {
    return localStorage.getItem('hideSmartTemplateStartPage');
  }

  getHideRearrangeDatasource() {
    return localStorage.getItem('hideRearrangeDatasource');
  }

  /**
   * Returns the companySlug for the logged user.
   */
  getCompanySlug() {
    return localStorage.getItem('companySlug');
  }

  /**
   * Returns the representation of the full name for the logged user.
   */
  getUserFullName() {
    return localStorage.getItem('userFullName');
  }

  /**
   * Returns the company default theme.
   */
  getCompanyDefaultThemeId() {
    return localStorage.getItem('companyDefaultThemeId');
  }

  /**
   * Returns the company lock default theme.
   */
  getLockAppsToDefaultTheme() {
    return localStorage.getItem('lockAppsToDefaultTheme');
  }

  /**
   * Returns the permissions array.
   */
  getPermissions() {
    return localStorage.getItem('userPermissions') || [];
  }

  /**
   * Returns the menu entries array.
   */
  getMenuEntries() {
    const menuEntries = JSON.parse(localStorage.getItem('menuEntries') || '');
    console.log(menuEntries);
    return menuEntries || [];
  }

  getUserInfo() {
    return {
      token: this.getToken(),
      companySlug: this.getCompanySlug(),
      userId: this.getUserId(),
      userName: this.getUserName(),
      userFullName: this.getUserFullName(),
      permissions: this.getPermissions(),
      menuEntries: this.getMenuEntries(),
    };
  }

  refreshSessionData(user: any) {
    localStorage.setItem('userName', user.email);
    localStorage.setItem('companyName', user.companyName);
    localStorage.setItem('department', user.department);
    localStorage.setItem('companyId', user.companyId);
    localStorage.setItem('companySlug', user.companySlug);
    localStorage.setItem('currentCompanyId', user.companyId);
    localStorage.setItem('userLastName', user.lastName);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userFullName', user.fullName);
    localStorage.setItem('userRoleId', user.roleId);
    localStorage.setItem('lockAppsToDefaultTheme', user.lockAppsToDefaultTheme);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('companyDefaultThemeId', user.companyDefaultThemeId);
    localStorage.setItem('guideStartPage', user.guideHideStartPage);
    localStorage.setItem('hideSmartTemplateStartPage', user.hideSmartTemplateStartPage);
    localStorage.setItem('userPermissions', JSON.stringify(user.permissions));
    localStorage.setItem('menuEntries', JSON.stringify(user.menuEntries));
    localStorage.setItem('isSelfProvisioning', user.isSelfProvisioning);

    if (user.defaultApp && user.defaultApp !== '' && user.defaultApp.length > 3 && user.defaultApp.indexOf('/') > -1) {
      localStorage.setItem('defaultApp', user.defaultApp);
    }
  }
  /**
   * Sets the session login info after succesful login.
   * @param token the JWT token
   * @param userName the logged username
   * @param user the object returned by the API
   */
  setSessionData(token: any, userName: string, user: any) {
    this.clearSession();
    localStorage.setItem('jwt', token);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userType', user.type);
    localStorage.setItem('companyName', user.companyName);
    localStorage.setItem('department', user.department);
    localStorage.setItem('companyId', user.companyId);
    localStorage.setItem('companySlug', user.companySlug);
    localStorage.setItem('lockAppsToDefaultTheme', user.lockAppsToDefaultTheme);
    localStorage.setItem('companyDefaultThemeId', user.companyDefaultThemeId);
    localStorage.setItem('currentCompanyId', user.companyId);
    localStorage.setItem('userLastName', user.lastName);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userFullName', user.fullName);
    localStorage.setItem('userRoleId', user.roleId);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('guideStartPage', user.guideHideStartPage);
    localStorage.setItem('hideSmartTemplateStartPage', user.hideSmartTemplateStartPage);
    localStorage.setItem('userPermissions', JSON.stringify(user.permissions));
    localStorage.setItem('menuEntries', JSON.stringify(user.menuEntries));
    localStorage.setItem('isSelfProvisioning', user.isSelfProvisioning);

    if (user.defaultApp && user.defaultApp !== '' && user.defaultApp.length > 3 && user.defaultApp.indexOf('/') > -1) {
      localStorage.setItem('defaultApp', user.defaultApp);
    }
  }

  /**
   * Set the company id currently selected.
   */
  setCurrentCompanyId(companyId: any) {
    localStorage.setItem('currentCompanyId', companyId);
  }

  setDocumentationStartPage(condition: string) {
    localStorage.setItem('guideStartPage', condition);
  }

  setHideSmartTemplateStartPage(condition: string) {
    localStorage.setItem('hideSmartTemplateStartPage', condition);
  }

  setHideRearrangeDatasource(condition: string) {
    localStorage.setItem('hideRearrangeDatasource', condition);
  }

  set2faLogged() {
    localStorage.setItem('2faLogged', 'true');
  }

  clearSession() {
    localStorage.clear();
  }
}
