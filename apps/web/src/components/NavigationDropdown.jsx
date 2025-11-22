import { Menu, Transition } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';
import { Fragment } from 'react';
import { motion } from 'framer-motion';

/**
 * NavigationDropdown - Menú dropdown responsive para iPad
 *
 * Diseñado específicamente para resoluciones de tablet (768px-1023px)
 * donde el menú horizontal no cabe pero el sidebar tampoco es ideal.
 *
 * @param {Array} items - Lista de items de navegación { id, label, url, isExternal, isButton }
 * @param {Function} onNavigate - Handler para navegación (maneja anchors y react-router)
 */
const NavigationDropdown = ({ items = [], onNavigate }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <Menu.Button
            as={motion.button}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2.5
                       px-6 py-3 rounded-xl
                       bg-gradient-to-r from-eg-purple to-eg-purple/90
                       text-white
                       hover:from-eg-purple/90 hover:to-eg-purple
                       focus:outline-none focus:ring-2 focus:ring-eg-purple/50 focus:ring-offset-2
                       transition-all duration-300
                       font-bold text-base tracking-wide
                       shadow-lg hover:shadow-xl
                       border border-eg-purple/20"
          >
            MENÚ
            <FaChevronDown
              className={`w-4 h-4 transition-transform duration-300
                         ${open ? 'rotate-180' : 'rotate-0'}`}
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute right-0 mt-3 w-72 origin-top-right
                        bg-white rounded-2xl shadow-2xl ring-1 ring-black/5
                        focus:outline-none z-50
                        max-h-[500px] overflow-y-auto
                        divide-y divide-gray-100
                        backdrop-blur-xl
                        border border-eg-purple/10"
            >
              <div className="py-2">
                {items.map((item) => (
                  <Menu.Item key={item.id}>
                    {({ active }) => (
                      <a
                        href={item.url}
                        onClick={(e) => onNavigate(e, item)}
                        target={item.isExternal ? '_blank' : undefined}
                        rel={item.isExternal ? 'noopener noreferrer' : undefined}
                        className={`
                          group flex items-center w-full px-6 py-4 text-base
                          transition-all duration-200
                          ${active
                            ? 'bg-gradient-to-r from-eg-purple/10 to-eg-purple/5 text-eg-purple font-bold border-l-4 border-eg-purple'
                            : 'text-eg-black hover:bg-gray-50 font-medium border-l-4 border-transparent'
                          }
                          ${item.isButton ? 'font-bold' : ''}
                        `}
                      >
                        <span className="flex-1">
                          {item.label}
                        </span>
                        {active && (
                          <motion.div
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                            className="w-2 h-2 rounded-full bg-eg-purple ml-2 shadow-lg"
                          />
                        )}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default NavigationDropdown;
