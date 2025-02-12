(function($) {
  'use strict';

  if (typeof jQuery === 'undefined') {
      throw new Error('O JavaScript do Bootstrap requer jQuery');
  }

  var version = $.fn.jquery.split(' ')[0].split('.');
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
      throw new Error('O JavaScript do Bootstrap requer jQuery versão 1.9.1 ou superior, mas inferior à versão 4');
  }

  // Verifica se o Bootstrap 5 já está carregado para evitar conflitos
  if (typeof bootstrap !== 'undefined') {
      console.warn('Bootstrap 5 detectado! Evitando conflitos com Bootstrap 3.');
      return;
  }

  /* ========================================================================
   * Apenas mantém os scripts essenciais, removendo os desnecessários.
   * Mantemos transições, alertas e dropdowns se forem necessários.
   * ======================================================================== */

  +function ($) {
      'use strict';

      var Alert = function (el) {
          $(el).on('click', '[data-dismiss="alert"]', this.close);
      };

      Alert.VERSION = '3.3.7';
      Alert.TRANSITION_DURATION = 150;

      Alert.prototype.close = function (e) {
          var $this = $(this);
          var selector = $this.attr('data-target');
          if (!selector) {
              selector = $this.attr('href');
              selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
          }

          var $parent = $(selector === '#' ? [] : selector);
          if (e) e.preventDefault();
          if (!$parent.length) {
              $parent = $this.closest('.alert');
          }

          $parent.trigger(e = $.Event('close.bs.alert'));
          if (e.isDefaultPrevented()) return;

          function removeElement() {
              $parent.detach().trigger('closed.bs.alert').remove();
          }

          $.support.transition && $parent.hasClass('fade') ?
              $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(Alert.TRANSITION_DURATION) :
              removeElement();
      };

      function Plugin(option) {
          return this.each(function () {
              var $this = $(this);
              var data = $this.data('bs.alert');
              if (!data) $this.data('bs.alert', (data = new Alert(this)));
              if (typeof option == 'string') data[option].call($this);
          });
      }

      var old = $.fn.alert;
      $.fn.alert = Plugin;
      $.fn.alert.Constructor = Alert;

      $.fn.alert.noConflict = function () {
          $.fn.alert = old;
          return this;
      };

      $(document).on('click.bs.alert.data-api', '[data-dismiss="alert"]', Alert.prototype.close);

  }(jQuery);

})(jQuery);
