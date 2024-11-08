import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth-profile/_services/auth.service';
import { CartShopsService } from 'src/app/modules/home/_services/cart-shops.service';

declare var $:any;
declare function loadModalDetailProduct():any;
declare function  alertDanger([]):any;
declare function alertSuccess([]):any;
@Component({
  selector: 'app-c-detail-product',
  templateUrl: './c-detail-product.component.html',
  styleUrls: ['./c-detail-product.component.css']
})
export class CDetailProductComponent implements OnInit {

  @Input() product_selected_modal:any;
  @Input() is_landing:boolean = false;
  color_size_selecteds:any  =[];
  quantity:any = 0;

  product_size_selected:any = null;
  product_size_color_selected:any = null;
  constructor(
    public _cartService: CartShopsService,
    public _authService: AuthService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      setTimeout(() => {
        loadModalDetailProduct();
      }, 25);
      if(!this.is_landing){
        $('.product_quickview').addClass('active');
        $('body').css('overflow-y', 'hidden');
      }

    }, 50);
  }

  selectedSize(size:any){
    this.product_size_selected = size;
    this.color_size_selecteds = size.variaciones;
  }
  addColor(color_size:any){
    // console.log(color_size);
    this.product_size_color_selected = color_size;
  }
  reduceQ(){
    if(this.quantity > 0){
      this.quantity --;
    }
  }
  addQ(){
    // if(){

    // }
    this.quantity ++;
  }
  getNewPriceS(price_soles:number,discount_g:any) {
    if(discount_g.type_discount == 1){ //%
      return price_soles - (price_soles*discount_g.discount*0.01);
    }
    if(discount_g.type_discount == 2){ //PEN
      return price_soles - price_soles*discount_g.discount;
    }
    return 0;
  }
  addCart(product_selected_modal:any){
    if(!this._authService.user){
      alertDanger("NECESITAS LOGUEARTE");
      return;
    }
    if(this.product_selected_modal.checked_inventario == 2){//MULTIPLE
      if(!this.product_size_selected || !this.product_size_color_selected){
        alertDanger("NECESITAS INGRESAR UN TAMAÑO Y COLOR");
        return;
      }
      if(this.quantity <= 0){
        alertDanger("NECESITAS INGRESAR UNA CANTIDAD");
        return;
      }
    }
    if(this.product_selected_modal.checked_inventario == 1){//UNITARIO
      if(this.quantity <= 0){
        alertDanger("NECESITAS INGRESAR UNA CANTIDAD");
        return;
      }
    }
    var type_discount_g = null;
    var discount_g = null;
    var precio_uni_total = 0;
    var code_discount_g = null;
    if(this.product_selected_modal.discount_g){
      type_discount_g = this.product_selected_modal.discount_g.type_discount;
      discount_g = this.product_selected_modal.discount_g.discount;
      code_discount_g = this.product_selected_modal.discount_g.code;
      precio_uni_total = this.getNewPriceS(this.product_selected_modal.price_soles,this.product_selected_modal.discount_g);
    }else{
      precio_uni_total = this.product_selected_modal.price_soles;
    }
    let data = {
      user_id: this._authService.user.id,
      product_id: this.product_selected_modal.id,
      type_discount: type_discount_g,
      discount: discount_g,
      cantidad: this.quantity,
      product_size_id: this.product_size_selected ? this.product_size_selected.id : null,
      product_color_size_id: this.product_size_color_selected ? this.product_size_color_selected.id : null,
      code_cupon: null,
      code_discount: code_discount_g,
      precio_unitario: precio_uni_total,
      subtotal: precio_uni_total,
      total: precio_uni_total * this.quantity,
    }
    this._cartService.addCartShop(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        alertDanger(resp.message_text);
        return;
      }else{
        this._cartService.changeCart(resp.cart_shop);
        alertSuccess("SE HA AGREADO EL PRODUCTO AL CARRITO");
      }
    })
  }

  addWish(product_selected_modal:any){
    if(!this._authService.user){
      alertDanger("NECESITAS LOGUEARTE");
      return;
    }
    if(this.product_selected_modal.checked_inventario == 2){//MULTIPLE
      if(!this.product_size_selected || !this.product_size_color_selected){
        alertDanger("NECESITAS INGRESAR UN TAMAÑO Y COLOR");
        return;
      }
    }
    let data = {
      user_id: this._authService.user.id,
      product_id: this.product_selected_modal.id,
      product_size_id: this.product_size_selected ? this.product_size_selected.id : null,
      product_color_size_id: this.product_size_color_selected ? this.product_size_color_selected.id : null,
    }
    this._cartService.addWishList(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        alertDanger(resp.message_text);
        return;
      }else{
        this._cartService.changeWish(resp.wishlist);
        alertSuccess("SE HA AGREADO EL PRODUCTO A LA LISTA DE DESEO");
      }
    })

  }
}
