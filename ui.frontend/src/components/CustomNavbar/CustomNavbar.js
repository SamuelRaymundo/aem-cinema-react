import React, {Component} from "react";
import { Link } from "react-router-dom";
import {MapTo} from "@adobe/aem-react-editable-components";

// Import your new CSS file here
import './CustomNavbar.css';

const CustomNavbarContentEditConfig = {
    emptyLabel: 'Custom Navbar',
    dragDropEnabled: true,

    isEmpty: function(props) {
        return !props || (
            (!props.navbarPages || !Array.isArray(props.navbarPages) || props.navbarPages.length === 0) &&
            (!props.topazPlusUrl || props.topazPlusUrl.trim().length === 0) &&
            (!props.accessibilityUrl || props.accessibilityUrl.trim().length === 0) &&
            (!props.faqUrl || props.faqUrl.trim().length === 0)
        );
    }
};

class CustomNavbar extends Component {
    render() {
        const { navbarPages, topazPlusUrl, accessibilityUrl, faqUrl } = this.props;

        return (
            <nav className="custom-navbar">

                {/* Top Navbar Section */}
                <div className="custom-navbar-top">
                    {/* Brand/Logo - Left Side */}
                    <div className="custom-navbar-brand">
                        <span>Topázio Cinemas</span>
                    </div>

                    {/* Top Links - Right Side */}
                    <div className="custom-navbar-links-top">
                        {topazPlusUrl && (
                            <a href={topazPlusUrl} className="custom-navbar-top-button">
                                TOPÁZIO PLUS FIDELIDADE
                            </a>
                        )}
                        {accessibilityUrl && (
                            <a href={accessibilityUrl} className="custom-navbar-top-link">
                                acessibilidade
                            </a>
                        )}
                        {faqUrl && (
                            <a href={faqUrl} className="custom-navbar-top-link">
                                dúvidas frequentes
                            </a>
                        )}
                    </div>
                </div>
                <div className="custom-navbar-bottom">
                    <ul className="custom-navbar-pages">
                        {navbarPages && navbarPages.length > 0 ? (
                            navbarPages.map((page, index) => (
                                <li key={page.path || index} className="custom-navbar-page-item">
                                    <Link
                                        to={page.path}
                                        title={page.title}
                                        className="custom-navbar-page-link"
                                    >
                                        {page.title}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="custom-navbar-no-items">No navigation items found.</li>
                        )}
                    </ul>
                </div>
            </nav>
        );
    }
}

export default MapTo('aem-cinema-react/components/customnavbar')(CustomNavbar, CustomNavbarContentEditConfig);