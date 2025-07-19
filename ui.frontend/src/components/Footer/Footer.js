import React, {Component} from 'react';
import './Footer.css'
import {MapTo} from "@adobe/aem-react-editable-components";

class Footer extends Component{
    render(){
        return (
            <footer className="aem-cinema-footer">
                <div className="footer-columns-container">
                    <div className="footer-column">
                        <h4>PROGRAMAÇÃO</h4>
                        <p><a href="#">Em cartaz</a></p>
                        <p><a href="#">Em breve</a></p>
                        <p><a href="#">Pré-venda</a></p>
                        <p><a href="#">Salas Bradesco Prime</a></p>
                    </div>
                    <div className="footer-column">
                        <h4>SNACK BAR</h4>
                        <p><a href="#">Snack bar</a></p>
                        <p><a href="#">Copo reutilizável</a></p>
                    </div>
                    <div className="footer-column">
                        <h4>TOPAZIO CLUB</h4>
                        <p><a href="#">Sobre o programa</a></p>
                        <p><a href="#">Topazio Club Fan</a></p>
                        <p><a href="#">Topazio Club Plus</a></p>
                        <p><a href="#">Topazio Club Black</a></p>
                    </div>
                    <div className="footer-column">
                        <h4>PARA EMPRESAS</h4>
                        <p><a href="#">Reserva de sala</a></p>
                        <p><a href="#">Vouchers corporativos</a></p>
                        <p><a href="#">Projeto Escola</a></p>
                    </div>
                    <div className="footer-column">
                        <h4>TOPAZIO</h4>
                        <p><a href="#">Sobre o Topazio</a></p>
                        <p><a href="#">Acessibilidade</a></p>
                        <p><a href="#">Imprensa</a></p>
                        <p><a href="#">Parcerias</a></p>
                        <p><a href="#">Trabalhe conosco</a></p>
                        <p><a href="#">Promoções</a></p>
                    </div>
                    <div className="footer-column">
                        <h4>CONTATO</h4>
                        <p><a href="#">Central de Atendimento</a></p>
                        <p><a href="#">FAQ</a></p>
                    </div>
                </div>

                <div className="footer-bottom">  <p>&copy; {new Date().getFullYear()} AEM CINEMA REACT. All rights reserved.</p>

                    <nav className="footer-nav">
                        <ul>
                            <li><a href="#">Política de Privacidade</a></li>
                            <li><a href="#">Termos de uso</a></li>
                        </ul>
                    </nav>
                </div>
            </footer>
        )
    }
}

export default MapTo('aem-cinema-react/components/footer')(Footer);