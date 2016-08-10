Name:           pdc-contact-browser
Version:        1.1.0
Release:        1%{?dist}
Summary:        Web UI for pdc's contact
Group:          Development/Libraries
License:        MIT
URL:            https://github.com/product-definition-center/pdc-contact-browser
Source0:        %{name}-%{version}.tar.gz
BuildArch:      noarch

%description
Web UI for viewing pdc contact

%prep
%setup -q -n %{name}-%{version}

%install
rm -rf %{buildroot}
mkdir -p %{buildroot}/var/www/html/%{name}
cp -R assets %{buildroot}/var/www/html/%{name}
cp -R css %{buildroot}/var/www/html/%{name}
cp -R src %{buildroot}/var/www/html/%{name}
cp index.html %{buildroot}/var/www/html/%{name}
cp serversetting.json %{buildroot}/var/www/html/%{name}

%files
%defattr(-,root,root)
/var/www/html/%{name}

%changelog
* Wed Aug 10 2016 Chuang Zhang <chuzhang@redhat.com> 1.1.0-1
- Change README.markdown and remove Makefile.    
- Improve the styles of contact browser
- Replace old jquery syntax with new one
- Remove redundant props passing
- Remove redundant css file
- Make network error dialog include resource info
- Allows users to edit contact info continuously
- Keep the lastest values after updating contact record
- Correct the position of table loading spinner
- Replace role drop-down list with react select component
- Refactor the loading spinner of loadForm
- Apply patternfly theme to Contact Browser
- Enables browser backwards/forwards button to perform pagination
- Correct the webpack config file
- Refactor webpack config file for building
- Append editing pane to table-toolbar

* Wed May 11 2016 Chuang Zhang <chuzhang@redhat.com> 1.0.0-2
- Bump Release to 2%{?dist}

* Wed May 11 2016 Chuang Zhang <chuzhang@redhat.com> 1.0.0-1
- Add New and Delete feature for contact browser. (chuzhang@redhat.com)
- Allow linking to particular result page in contact browser. (chuzhang@redhat.com)

* Wed Mar 9 2016 Chuang Zhang <chuzhang@redhat.com> 0.1.0-1
- init spec for pdc contact browser
