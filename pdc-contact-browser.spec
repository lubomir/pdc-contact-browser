Name:           pdc-contact-browser
Version:        0.1.0
Release:        1
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
cp -R build %{buildroot}/var/www/html/%{name}
cp -R css %{buildroot}/var/www/html/%{name}
cp -R src %{buildroot}/var/www/html/%{name}
cp index.html %{buildroot}/var/www/html/%{name}


%files
%defattr(-,root,root)
/var/www/html/%{name}

%changelog
* Wed Mar 9 2016 Chuang Zhang <chuzhang@redhat.com> 0.1.0-1
- init spec for pdc contact browser
